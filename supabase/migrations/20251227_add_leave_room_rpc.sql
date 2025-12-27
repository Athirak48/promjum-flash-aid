-- Function to handle leaving a room with auto-cleanup
CREATE OR REPLACE FUNCTION leave_game_room(
    p_room_id UUID,
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_is_host BOOLEAN;
    v_player_count INT;
    v_room_code VARCHAR;
BEGIN
    -- Get room info before deleting player
    SELECT room_code INTO v_room_code FROM game_rooms WHERE id = p_room_id;

    -- Check if the leaving user is the host
    SELECT is_host INTO v_is_host
    FROM room_players
    WHERE room_id = p_room_id AND user_id = p_user_id;

    -- Remove player from room
    DELETE FROM room_players
    WHERE room_id = p_room_id AND user_id = p_user_id;

    -- Check remaining players
    SELECT COUNT(*) INTO v_player_count
    FROM room_players
    WHERE room_id = p_room_id;

    -- Logic: Delete room if Host leaves OR No players left
    IF v_is_host = TRUE OR v_player_count = 0 THEN
        DELETE FROM game_rooms WHERE id = p_room_id;
        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Left room and room deleted', 
            'room_deleted', true
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Left room', 
        'room_deleted', false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
