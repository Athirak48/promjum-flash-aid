-- =====================================================
-- FIX FRIEND SYSTEM FUNCTIONS
-- Created: 2024-12-26
-- Fixes mismatched IDs (profile.id vs auth.users.id)
-- =====================================================

-- 1. FIX: Search users by nickname (Return p.user_id instead of p.id)
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
        p.user_id AS user_id, -- CHANGED from p.id
        p.nickname,
        p.friend_code,
        p.avatar_url,
        COALESCE(ux.total_xp, 0) AS total_xp,
        COALESCE(ux.level, 1) AS level,
        (
            SELECT f.status 
            FROM friendships f 
            WHERE (f.requester_id = p_current_user_id AND f.addressee_id = p.user_id) -- CHANGED from p.id
               OR (f.addressee_id = p_current_user_id AND f.requester_id = p.user_id) -- CHANGED from p.id
            LIMIT 1
        ) AS friendship_status
    FROM profiles p
    LEFT JOIN user_xp ux ON ux.user_id = p.user_id -- CHANGED from p.id (though usually ux uses user_id)
    WHERE p.user_id != p_current_user_id -- CHANGED from p.id
      AND p.nickname IS NOT NULL
      AND p.nickname ILIKE '%' || p_search_query || '%'
    ORDER BY 
        CASE WHEN p.nickname ILIKE p_search_query THEN 0 ELSE 1 END,
        p.nickname
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FIX: Get friends list (Join on p.user_id)
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
        p.user_id AS friend_id, -- CHANGED from p.id (optional but consistent)
        p.nickname,
        p.avatar_url,
        COALESCE(ux.total_xp, 0) AS total_xp,
        COALESCE(ux.level, 1) AS level,
        ROW_NUMBER() OVER (ORDER BY COALESCE(ux.total_xp, 0) DESC) AS rank
    FROM friends fr
    JOIN profiles p ON p.user_id = fr.fid -- CHANGED from p.id
    LEFT JOIN user_xp ux ON ux.user_id = p.user_id -- Assuming user_xp uses user_id
    ORDER BY total_xp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FIX: Get pending friend requests (Join on p.user_id)
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
    JOIN profiles p ON p.user_id = f.requester_id -- CHANGED from p.id
    LEFT JOIN user_xp ux ON ux.user_id = f.requester_id -- Assuming user_xp uses user_id
    WHERE f.addressee_id = p_user_id
      AND f.status = 'pending'
    ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
