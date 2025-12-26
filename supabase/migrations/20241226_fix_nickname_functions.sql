-- =====================================================
-- FIX: Use user_id instead of id for profile lookup
-- FIX: Use UPSERT (INSERT ON CONFLICT) for set_nickname
-- =====================================================

-- 1. Redefine check_nickname_available to use user_id
CREATE OR REPLACE FUNCTION check_nickname_available(
    p_nickname VARCHAR,
    p_current_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
    available BOOLEAN,
    message TEXT
) AS $$
BEGIN
    -- Validate nickname format
    IF p_nickname IS NULL OR LENGTH(TRIM(p_nickname)) < 3 THEN
        RETURN QUERY SELECT false, 'ชื่อต้องมีอย่างน้อย 3 ตัวอักษร'::TEXT;
        RETURN;
    END IF;
    
    IF LENGTH(p_nickname) > 20 THEN
        RETURN QUERY SELECT false, 'ชื่อต้องไม่เกิน 20 ตัวอักษร'::TEXT;
        RETURN;
    END IF;
    
    -- Check for invalid characters (only allow letters, numbers, underscore)
    IF p_nickname !~ '^[a-zA-Z0-9ก-ฮะ-์_]+$' THEN
        RETURN QUERY SELECT false, 'ชื่อใช้ได้เฉพาะ ตัวอักษร ตัวเลข และ _ เท่านั้น'::TEXT;
        RETURN;
    END IF;
    
    -- Check if nickname already exists (case-insensitive)
    IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE LOWER(nickname) = LOWER(TRIM(p_nickname))
        AND (p_current_user_id IS NULL OR user_id != p_current_user_id) -- Changed id to user_id
    ) THEN
        RETURN QUERY SELECT false, 'ชื่อนี้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น'::TEXT;
        RETURN;
    END IF;
    
    -- Nickname is available
    RETURN QUERY SELECT true, 'ชื่อนี้ใช้ได้!'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Redefine set_nickname to use UPSERT and user_id
CREATE OR REPLACE FUNCTION set_nickname(
    p_user_id UUID,
    p_nickname VARCHAR
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_check_result RECORD;
BEGIN
    -- First check if nickname is available
    SELECT * INTO v_check_result 
    FROM check_nickname_available(p_nickname, p_user_id);
    
    IF NOT v_check_result.available THEN
        RETURN QUERY SELECT false, v_check_result.message;
        RETURN;
    END IF;
    
    -- Insert or Update profile (UPSERT)
    INSERT INTO profiles (user_id, nickname, updated_at)
    VALUES (p_user_id, TRIM(p_nickname), NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET 
        nickname = EXCLUDED.nickname,
        updated_at = NOW();
    
    RETURN QUERY SELECT true, 'ตั้งชื่อสำเร็จ!'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
