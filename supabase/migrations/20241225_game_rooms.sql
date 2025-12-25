-- =====================================================
-- MULTIPLAYER GAME ROOMS MIGRATION
-- Created: 2024-12-25
-- =====================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. GAME ROOMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS game_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(6) UNIQUE NOT NULL,
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'selecting', 'playing', 'finished')),
    max_players INT DEFAULT 5 CHECK (max_players >= 2 AND max_players <= 5),
    
    -- Game settings
    selected_games TEXT[] DEFAULT '{}', -- ['quiz', 'matching', 'ninja-slice']
    current_game_index INT DEFAULT 0,
    
    -- Competition settings
    min_vocab INT DEFAULT 10,
    max_vocab INT DEFAULT 50,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ
);

-- =====================================================
-- 2. ROOM PLAYERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS room_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nickname VARCHAR(50),
    avatar_url TEXT,
    is_ready BOOLEAN DEFAULT false,
    is_host BOOLEAN DEFAULT false,
    
    -- Total scores across all games
    total_score INT DEFAULT 0,
    total_time_ms INT DEFAULT 0,
    final_rank INT,
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(room_id, user_id)
);

-- =====================================================
-- 3. ROOM VOCABULARY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS room_vocabulary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
    flashcard_id UUID NOT NULL, -- Can be from flashcards or user_flashcards
    front_text TEXT NOT NULL,
    back_text TEXT NOT NULL,
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. GAME RESULTS TABLE (Per game per player)
-- =====================================================
CREATE TABLE IF NOT EXISTS game_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    game_index INT NOT NULL, -- Which game in the series (0, 1, 2)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Results
    score INT DEFAULT 0,
    time_ms INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    total_count INT DEFAULT 0,
    rank INT,
    
    -- Scoring type
    scoring_type VARCHAR(20) CHECK (scoring_type IN ('time', 'score')),
    
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(room_id, game_type, game_index, user_id)
);

-- =====================================================
-- 5. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_game_rooms_room_code ON game_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_game_rooms_host ON game_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_user ON room_players(user_id);
CREATE INDEX IF NOT EXISTS idx_room_vocabulary_room ON room_vocabulary(room_id);
CREATE INDEX IF NOT EXISTS idx_game_results_room ON game_results(room_id);

-- =====================================================
-- 6. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- Game Rooms: Anyone can view, only host can modify
CREATE POLICY "Anyone can view rooms" ON game_rooms
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can create rooms" ON game_rooms
    FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update room" ON game_rooms
    FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Host can delete room" ON game_rooms
    FOR DELETE USING (auth.uid() = host_id);

-- Room Players: Anyone in room can view, self can manage
CREATE POLICY "Anyone can view players" ON room_players
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can join" ON room_players
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Self can update" ON room_players
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Self can leave" ON room_players
    FOR DELETE USING (auth.uid() = user_id);

-- Room Vocabulary: Players can view and add
CREATE POLICY "Room players can view vocab" ON room_vocabulary
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM room_players WHERE room_id = room_vocabulary.room_id AND user_id = auth.uid())
    );

CREATE POLICY "Room players can add vocab" ON room_vocabulary
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM room_players WHERE room_id = room_vocabulary.room_id AND user_id = auth.uid())
    );

-- Game Results: Players can view and submit own
CREATE POLICY "Anyone can view results" ON game_results
    FOR SELECT USING (true);

CREATE POLICY "Players can submit results" ON game_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players can update own results" ON game_results
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 7. FUNCTION: Generate unique room code
-- =====================================================
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(6) AS $$
DECLARE
    new_code VARCHAR(6);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 6-digit code (numbers only for easy sharing)
        new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM game_rooms WHERE room_code = new_code) INTO code_exists;
        
        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. FUNCTION: Create game room
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
    SELECT nickname, avatar_url INTO v_nickname, v_avatar
    FROM profiles WHERE id = p_host_id;
    
    -- Add host as player
    INSERT INTO room_players (room_id, user_id, nickname, avatar_url, is_ready, is_host)
    VALUES (v_room_id, p_host_id, v_nickname, v_avatar, true, true);
    
    RETURN QUERY SELECT v_room_id, v_room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. FUNCTION: Join room by code
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
    -- Find room
    SELECT id, status, max_players INTO v_room_id, v_status, v_max_players
    FROM game_rooms WHERE room_code = UPPER(p_room_code);
    
    IF v_room_id IS NULL THEN
        RETURN QUERY SELECT false, 'ไม่พบห้อง กรุณาตรวจสอบรหัส'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    IF v_status != 'waiting' THEN
        RETURN QUERY SELECT false, 'ห้องเริ่มเล่นแล้ว'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if already in room
    IF EXISTS (SELECT 1 FROM room_players WHERE room_id = v_room_id AND user_id = p_user_id) THEN
        RETURN QUERY SELECT true, 'อยู่ในห้องแล้ว'::TEXT, v_room_id;
        RETURN;
    END IF;
    
    -- Check player count
    SELECT COUNT(*) INTO v_current_players FROM room_players WHERE room_id = v_room_id;
    
    IF v_current_players >= v_max_players THEN
        RETURN QUERY SELECT false, 'ห้องเต็มแล้ว'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Get user profile
    SELECT nickname, avatar_url INTO v_nickname, v_avatar
    FROM profiles WHERE id = p_user_id;
    
    -- Join room
    INSERT INTO room_players (room_id, user_id, nickname, avatar_url, is_ready, is_host)
    VALUES (v_room_id, p_user_id, v_nickname, v_avatar, false, false);
    
    RETURN QUERY SELECT true, 'เข้าห้องสำเร็จ'::TEXT, v_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. FUNCTION: Submit game result
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
    
    -- Calculate ranks for this game
    WITH ranked AS (
        SELECT 
            id,
            CASE 
                WHEN v_scoring_type = 'time' THEN 
                    ROW_NUMBER() OVER (ORDER BY time_ms ASC)
                ELSE 
                    ROW_NUMBER() OVER (ORDER BY score DESC, time_ms ASC)
            END as new_rank
        FROM game_results 
        WHERE room_id = p_room_id AND game_type = p_game_type AND game_index = p_game_index
    )
    UPDATE game_results gr
    SET rank = ranked.new_rank
    FROM ranked
    WHERE gr.id = ranked.id;
    
    -- Update total scores in room_players
    UPDATE room_players rp
    SET 
        total_score = (
            SELECT COALESCE(SUM(score), 0) 
            FROM game_results 
            WHERE room_id = p_room_id AND user_id = rp.user_id
        ),
        total_time_ms = (
            SELECT COALESCE(SUM(time_ms), 0) 
            FROM game_results 
            WHERE room_id = p_room_id AND user_id = rp.user_id
        )
    WHERE room_id = p_room_id AND user_id = p_user_id;
    
    RETURN QUERY SELECT true, 'บันทึกผลสำเร็จ'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. FUNCTION: Calculate final rankings
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_final_rankings(p_room_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Update final ranks based on total score, then time
    WITH ranked AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (ORDER BY total_score DESC, total_time_ms ASC) as new_rank
        FROM room_players 
        WHERE room_id = p_room_id
    )
    UPDATE room_players rp
    SET final_rank = ranked.new_rank
    FROM ranked
    WHERE rp.id = ranked.id;
    
    -- Mark room as finished
    UPDATE game_rooms SET status = 'finished', finished_at = NOW()
    WHERE id = p_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 12. FUNCTION: Get room details
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
        (SELECT COUNT(*) FROM room_players WHERE room_id = gr.id) as player_count,
        gr.created_at
    FROM game_rooms gr
    WHERE gr.room_code = UPPER(p_room_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 13. Enable Realtime for room updates
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE room_vocabulary;
ALTER PUBLICATION supabase_realtime ADD TABLE game_results;
