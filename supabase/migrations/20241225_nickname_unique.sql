-- =====================================================
-- NICKNAME UNIQUENESS FUNCTIONS
-- Created: 2024-12-25
-- =====================================================

-- =====================================================
-- 1. FUNCTION: Check if nickname is available
-- =====================================================
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
        AND (p_current_user_id IS NULL OR id != p_current_user_id)
    ) THEN
        RETURN QUERY SELECT false, 'ชื่อนี้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น'::TEXT;
        RETURN;
    END IF;
    
    -- Nickname is available
    RETURN QUERY SELECT true, 'ชื่อนี้ใช้ได้!'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. FUNCTION: Set nickname with uniqueness check
-- =====================================================
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
    
    -- Update the profile
    UPDATE profiles 
    SET nickname = TRIM(p_nickname),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    IF FOUND THEN
        RETURN QUERY SELECT true, 'ตั้งชื่อสำเร็จ!'::TEXT;
    ELSE
        RETURN QUERY SELECT false, 'ไม่พบโปรไฟล์ของคุณ'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. Add UNIQUE constraint on lowercase nickname
-- =====================================================
-- First, create a function to lowercase nickname
CREATE OR REPLACE FUNCTION lowercase_nickname()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.nickname IS NOT NULL THEN
        NEW.nickname := TRIM(NEW.nickname);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to normalize nickname
DROP TRIGGER IF EXISTS trigger_normalize_nickname ON profiles;
CREATE TRIGGER trigger_normalize_nickname
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION lowercase_nickname();

-- Add unique index for case-insensitive uniqueness
DROP INDEX IF EXISTS idx_profiles_nickname_unique;
CREATE UNIQUE INDEX idx_profiles_nickname_unique 
ON profiles (LOWER(nickname)) 
WHERE nickname IS NOT NULL;
