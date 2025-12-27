-- Fix for Ambiguous Column Reference in Multiplayer Functions
-- The error "column reference 'room_id' is ambiguous" occurs because parameter names or internal variables clash with column names in SQL queries.
-- We fix this by aliasing tables and being explicit about column references.

-- =====================================================
-- 1. FIX: Join Room Function
-- =====================================================
CREATE OR REPLACE FUNCTION join_room_by_code(
    p_user_id UUID,
    p_room_code VARCHAR
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    room_id UUID
) AS $$
DECLARE
    v_room_id UUID;
    v_status VARCHAR;
    v_current_players INT;
    v_max_players INT;
    v_nickname VARCHAR;
    v_avatar TEXT;
BEGIN
    -- Find room with explicit alias
    SELECT gr.id, gr.status, gr.max_players INTO v_room_id, v_status, v_max_players
    FROM game_rooms gr 
    WHERE gr.room_code = UPPER(p_room_code);
    
    IF v_room_id IS NULL THEN
        RETURN QUERY SELECT false, 'ไม่พบห้อง กรุณาตรวจสอบรหัส'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    IF v_status != 'waiting' THEN
        RETURN QUERY SELECT false, 'ห้องเริ่มเล่นแล้ว'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if already in room (explicit checks)
    IF EXISTS (SELECT 1 FROM room_players rp WHERE rp.room_id = v_room_id AND rp.user_id = p_user_id) THEN
        RETURN QUERY SELECT true, 'อยู่ในห้องแล้ว'::TEXT, v_room_id;
        RETURN;
    END IF;
    
    -- Check player count (explicit aliasing)
    SELECT COUNT(*) INTO v_current_players FROM room_players rp WHERE rp.room_id = v_room_id;
    
    IF v_current_players >= v_max_players THEN
        RETURN QUERY SELECT false, 'ห้องเต็มแล้ว'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Get user profile
    SELECT p.nickname, p.avatar_url INTO v_nickname, v_avatar
    FROM profiles p 
    WHERE p.id = p_user_id;
    
    -- Join room (Explicit Insert)
    INSERT INTO room_players (room_id, user_id, nickname, avatar_url, is_ready, is_host)
    VALUES (v_room_id, p_user_id, v_nickname, v_avatar, false, false);
    
    RETURN QUERY SELECT true, 'เข้าห้องสำเร็จ'::TEXT, v_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 2. FIX: Create Room Function
-- =====================================================
CREATE OR REPLACE FUNCTION create_game_room(
    p_host_id UUID,
    p_max_players INT DEFAULT 5
)
RETURNS TABLE(
    room_id UUID,
    room_code VARCHAR
) AS $$
DECLARE
    v_room_id UUID;
    v_room_code VARCHAR(6);
    v_nickname VARCHAR;
    v_avatar TEXT;
BEGIN
    -- Generate room code
    v_room_code := generate_room_code();
    
    -- Create room
    INSERT INTO game_rooms (room_code, host_id, max_players)
    VALUES (v_room_code, p_host_id, p_max_players)
    RETURNING id INTO v_room_id;
    
    -- Get host profile
    SELECT p.nickname, p.avatar_url INTO v_nickname, v_avatar
    FROM profiles p 
    WHERE p.id = p_host_id;
    
    -- Add host as player
    INSERT INTO room_players (room_id, user_id, nickname, avatar_url, is_ready, is_host)
    VALUES (v_room_id, p_host_id, v_nickname, v_avatar, true, true);
    
    RETURN QUERY SELECT v_room_id, v_room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 3. FIX: Submit Game Result Function
-- =====================================================
CREATE OR REPLACE FUNCTION submit_game_result(
    p_room_id UUID,
    p_user_id UUID,
    p_game_type VARCHAR,
    p_game_index INT,
    p_score INT,
    p_time_ms INT,
    p_correct_count INT,
    p_total_count INT
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_scoring_type VARCHAR;
BEGIN
    -- Determine scoring type
    IF p_game_type IN ('honeycomb', 'matching', 'ninja-slice') THEN
        v_scoring_type := 'time';
    ELSE
        v_scoring_type := 'score';
    END IF;
    
    -- Insert or update result
    INSERT INTO game_results (room_id, game_type, game_index, user_id, score, time_ms, correct_count, total_count, scoring_type)
    VALUES (p_room_id, p_game_type, p_game_index, p_user_id, p_score, p_time_ms, p_correct_count, p_total_count, v_scoring_type)
    ON CONFLICT (room_id, game_type, game_index, user_id) 
    DO UPDATE SET 
        score = EXCLUDED.score,
        time_ms = EXCLUDED.time_ms,
        correct_count = EXCLUDED.correct_count,
        total_count = EXCLUDED.total_count,
        submitted_at = NOW();
    
    -- Calculate ranks for this game using specific aliases
    WITH ranked AS (
        SELECT 
            gr.id,
            CASE 
                WHEN v_scoring_type = 'time' THEN 
                    ROW_NUMBER() OVER (ORDER BY gr.time_ms ASC)
                ELSE 
                    ROW_NUMBER() OVER (ORDER BY gr.score DESC, gr.time_ms ASC)
            END as new_rank
        FROM game_results gr
        WHERE gr.room_id = p_room_id AND gr.game_type = p_game_type AND gr.game_index = p_game_index
    )
    UPDATE game_results gr_target
    SET rank = ranked.new_rank
    FROM ranked
    WHERE gr_target.id = ranked.id;
    
    -- Update total scores in room_players with explicit aliases
    UPDATE room_players rp
    SET 
        total_score = (
            SELECT COALESCE(SUM(gr.score), 0) 
            FROM game_results gr
            WHERE gr.room_id = p_room_id AND gr.user_id = rp.user_id
        ),
        total_time_ms = (
            SELECT COALESCE(SUM(gr.time_ms), 0) 
            FROM game_results gr
            WHERE gr.room_id = p_room_id AND gr.user_id = rp.user_id
        )
    WHERE rp.room_id = p_room_id AND rp.user_id = p_user_id;
    
    RETURN QUERY SELECT true, 'บันทึกผลสำเร็จ'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 4. FIX: Get Room Details Function
-- =====================================================
CREATE OR REPLACE FUNCTION get_room_details(p_room_code VARCHAR)
RETURNS TABLE(
    room_id UUID,
    room_code VARCHAR,
    status VARCHAR,
    host_id UUID,
    max_players INT,
    selected_games TEXT[],
    current_game_index INT,
    player_count BIGINT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gr.id as room_id,
        gr.room_code,
        gr.status,
        gr.host_id,
        gr.max_players,
        gr.selected_games,
        gr.current_game_index,
        (SELECT COUNT(*) FROM room_players rp WHERE rp.room_id = gr.id) as player_count,
        gr.created_at
    FROM game_rooms gr
    WHERE gr.room_code = UPPER(p_room_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
