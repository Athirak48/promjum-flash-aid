-- Function to toggle ready status
CREATE OR REPLACE FUNCTION toggle_player_ready(
    p_room_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_ready BOOLEAN;
BEGIN
    -- Check if user is in room
    SELECT is_ready INTO v_current_ready
    FROM room_players
    WHERE room_id = p_room_id AND user_id = p_user_id;
    
    IF v_current_ready IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Toggle status
    UPDATE room_players
    SET is_ready = NOT v_current_ready
    WHERE room_id = p_room_id AND user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
