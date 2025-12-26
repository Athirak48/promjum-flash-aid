-- Create table to track user clicks/participation in Lobby
CREATE TABLE IF NOT EXISTS lobby_activities (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lobby_activities ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view count (we'll use a function for this mostly, but good to have)
CREATE POLICY "Anyone can view lobby activities" ON lobby_activities
    FOR SELECT USING (true);

-- Allow authenticated users to insert their own record (only once due to PK)
CREATE POLICY "Users can join lobby event" ON lobby_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to join the event (click the hammer/egg)
CREATE OR REPLACE FUNCTION join_lobby_event(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT, new_count BIGINT) AS $$
DECLARE
    v_count BIGINT;
BEGIN
    -- Try to insert
    INSERT INTO lobby_activities (user_id)
    VALUES (p_user_id);
    
    -- Get new count
    SELECT COUNT(*) INTO v_count FROM lobby_activities;
    
    RETURN QUERY SELECT true, 'Joined successfully'::TEXT, v_count;
EXCEPTION 
    WHEN unique_violation THEN
        -- Already joined, just return current count
        SELECT COUNT(*) INTO v_count FROM lobby_activities;
        RETURN QUERY SELECT false, 'Already joined'::TEXT, v_count;
    WHEN OTHERS THEN
        RETURN QUERY SELECT false, 'Error joining'::TEXT, 0::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get stats (count and user status)
CREATE OR REPLACE FUNCTION get_lobby_stats(p_user_id UUID)
RETURNS TABLE(total_count BIGINT, has_joined BOOLEAN) AS $$
BEGIN
    RETURN QUERY SELECT 
        (SELECT COUNT(*) FROM lobby_activities),
        (SELECT EXISTS(SELECT 1 FROM lobby_activities WHERE user_id = p_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
