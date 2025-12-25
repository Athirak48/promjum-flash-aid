-- =====================================================
-- FRIEND SYSTEM MIGRATION
-- Created: 2024-12-25
-- =====================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. UPDATE USER PROFILES - Add friend-related fields
-- =====================================================
-- Check if columns exist before adding
DO $$ 
BEGIN
    -- Add nickname column for searching (display name for friends)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'nickname') THEN
        ALTER TABLE profiles ADD COLUMN nickname VARCHAR(50);
    END IF;
    
    -- Add friend_code for easy sharing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'friend_code') THEN
        ALTER TABLE profiles ADD COLUMN friend_code VARCHAR(8) UNIQUE;
    END IF;
END $$;

-- =====================================================
-- 2. FRIENDSHIPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    addressee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate friendships
    UNIQUE(requester_id, addressee_id)
);

-- =====================================================
-- 3. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_friend_code ON profiles(friend_code);

-- =====================================================
-- 4. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships where they are involved
CREATE POLICY "Users can view own friendships" ON friendships
    FOR SELECT USING (
        auth.uid() = requester_id OR auth.uid() = addressee_id
    );

-- Users can insert friendships as requester
CREATE POLICY "Users can send friend requests" ON friendships
    FOR INSERT WITH CHECK (
        auth.uid() = requester_id
    );

-- Users can update friendships they received (to accept/reject)
CREATE POLICY "Users can respond to friend requests" ON friendships
    FOR UPDATE USING (
        auth.uid() = addressee_id AND status = 'pending'
    );

-- Users can delete friendships they are part of
CREATE POLICY "Users can remove friendships" ON friendships
    FOR DELETE USING (
        auth.uid() = requester_id OR auth.uid() = addressee_id
    );

-- =====================================================
-- 5. FUNCTION: Generate unique friend code
-- =====================================================
CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    new_code VARCHAR(8);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 8-character code (letters + numbers)
        new_code := UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8)
        );
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM profiles WHERE friend_code = new_code) INTO code_exists;
        
        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FUNCTION: Search users by nickname
-- =====================================================
CREATE OR REPLACE FUNCTION search_users_by_nickname(
    p_search_query TEXT,
    p_current_user_id UUID
)
RETURNS TABLE(
    user_id UUID,
    nickname VARCHAR,
    friend_code VARCHAR,
    avatar_url TEXT,
    total_xp INTEGER,
    level INTEGER,
    friendship_status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.nickname,
        p.friend_code,
        p.avatar_url,
        COALESCE(ux.total_xp, 0) AS total_xp,
        COALESCE(ux.level, 1) AS level,
        (
            SELECT f.status 
            FROM friendships f 
            WHERE (f.requester_id = p_current_user_id AND f.addressee_id = p.id)
               OR (f.addressee_id = p_current_user_id AND f.requester_id = p.id)
            LIMIT 1
        ) AS friendship_status
    FROM profiles p
    LEFT JOIN user_xp ux ON ux.user_id = p.id
    WHERE p.id != p_current_user_id
      AND p.nickname IS NOT NULL
      AND p.nickname ILIKE '%' || p_search_query || '%'
    ORDER BY 
        CASE WHEN p.nickname ILIKE p_search_query THEN 0 ELSE 1 END,
        p.nickname
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. FUNCTION: Get friends list with XP
-- =====================================================
CREATE OR REPLACE FUNCTION get_friends_leaderboard(p_user_id UUID)
RETURNS TABLE(
    friend_id UUID,
    nickname VARCHAR,
    avatar_url TEXT,
    total_xp INTEGER,
    level INTEGER,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH friends AS (
        SELECT 
            CASE 
                WHEN f.requester_id = p_user_id THEN f.addressee_id
                ELSE f.requester_id
            END AS fid
        FROM friendships f
        WHERE (f.requester_id = p_user_id OR f.addressee_id = p_user_id)
          AND f.status = 'accepted'
    )
    SELECT 
        p.id AS friend_id,
        p.nickname,
        p.avatar_url,
        COALESCE(ux.total_xp, 0) AS total_xp,
        COALESCE(ux.level, 1) AS level,
        ROW_NUMBER() OVER (ORDER BY COALESCE(ux.total_xp, 0) DESC) AS rank
    FROM friends fr
    JOIN profiles p ON p.id = fr.fid
    LEFT JOIN user_xp ux ON ux.user_id = p.id
    ORDER BY total_xp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. FUNCTION: Get pending friend requests
-- =====================================================
CREATE OR REPLACE FUNCTION get_pending_friend_requests(p_user_id UUID)
RETURNS TABLE(
    request_id UUID,
    requester_id UUID,
    nickname VARCHAR,
    avatar_url TEXT,
    total_xp INTEGER,
    level INTEGER,
    requested_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id AS request_id,
        f.requester_id,
        p.nickname,
        p.avatar_url,
        COALESCE(ux.total_xp, 0) AS total_xp,
        COALESCE(ux.level, 1) AS level,
        f.created_at AS requested_at
    FROM friendships f
    JOIN profiles p ON p.id = f.requester_id
    LEFT JOIN user_xp ux ON ux.user_id = f.requester_id
    WHERE f.addressee_id = p_user_id
      AND f.status = 'pending'
    ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. FUNCTION: Send friend request
-- =====================================================
CREATE OR REPLACE FUNCTION send_friend_request(
    p_requester_id UUID,
    p_addressee_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    request_id UUID
) AS $$
DECLARE
    v_existing_id UUID;
    v_existing_status VARCHAR;
    v_new_id UUID;
BEGIN
    -- Check for existing friendship
    SELECT id, status INTO v_existing_id, v_existing_status
    FROM friendships 
    WHERE (requester_id = p_requester_id AND addressee_id = p_addressee_id)
       OR (requester_id = p_addressee_id AND addressee_id = p_requester_id);
    
    IF v_existing_id IS NOT NULL THEN
        IF v_existing_status = 'accepted' THEN
            RETURN QUERY SELECT false, 'Already friends'::TEXT, v_existing_id;
            RETURN;
        ELSIF v_existing_status = 'pending' THEN
            RETURN QUERY SELECT false, 'Request already pending'::TEXT, v_existing_id;
            RETURN;
        ELSIF v_existing_status = 'blocked' THEN
            RETURN QUERY SELECT false, 'Cannot send request'::TEXT, NULL::UUID;
            RETURN;
        END IF;
    END IF;
    
    -- Create new friend request
    INSERT INTO friendships (requester_id, addressee_id, status)
    VALUES (p_requester_id, p_addressee_id, 'pending')
    RETURNING id INTO v_new_id;
    
    RETURN QUERY SELECT true, 'Friend request sent'::TEXT, v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. FUNCTION: Accept friend request
-- =====================================================
CREATE OR REPLACE FUNCTION accept_friend_request(
    p_user_id UUID,
    p_request_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
BEGIN
    UPDATE friendships
    SET status = 'accepted', updated_at = NOW()
    WHERE id = p_request_id
      AND addressee_id = p_user_id
      AND status = 'pending';
    
    IF FOUND THEN
        RETURN QUERY SELECT true, 'Friend request accepted'::TEXT;
    ELSE
        RETURN QUERY SELECT false, 'Request not found or already processed'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. FUNCTION: Reject friend request
-- =====================================================
CREATE OR REPLACE FUNCTION reject_friend_request(
    p_user_id UUID,
    p_request_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
BEGIN
    UPDATE friendships
    SET status = 'rejected', updated_at = NOW()
    WHERE id = p_request_id
      AND addressee_id = p_user_id
      AND status = 'pending';
    
    IF FOUND THEN
        RETURN QUERY SELECT true, 'Friend request rejected'::TEXT;
    ELSE
        RETURN QUERY SELECT false, 'Request not found or already processed'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 12. FUNCTION: Remove friend
-- =====================================================
CREATE OR REPLACE FUNCTION remove_friend(
    p_user_id UUID,
    p_friend_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
BEGIN
    DELETE FROM friendships
    WHERE ((requester_id = p_user_id AND addressee_id = p_friend_id)
        OR (requester_id = p_friend_id AND addressee_id = p_user_id))
      AND status = 'accepted';
    
    IF FOUND THEN
        RETURN QUERY SELECT true, 'Friend removed'::TEXT;
    ELSE
        RETURN QUERY SELECT false, 'Friendship not found'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 13. TRIGGER: Auto-generate friend code on profile creation
-- =====================================================
CREATE OR REPLACE FUNCTION auto_generate_friend_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.friend_code IS NULL THEN
        NEW.friend_code := generate_friend_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_friend_code ON profiles;
CREATE TRIGGER trigger_auto_friend_code
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_friend_code();

-- =====================================================
-- 14. UPDATE existing profiles with friend codes
-- =====================================================
UPDATE profiles 
SET friend_code = generate_friend_code()
WHERE friend_code IS NULL;
