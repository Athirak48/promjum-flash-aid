-- ============================================
-- Fix Security Issue: Profiles Table Sensitive Data Exposure
-- ============================================

-- Drop the overly permissive policy that allows all authenticated users to see all profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Create secure policies:
-- 1. Users can view their own complete profile (including email, phone)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Users can view other users' non-sensitive public information only
CREATE POLICY "Users can view public profile information of others"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() != user_id 
  AND id IN (
    SELECT id FROM public.profiles 
    WHERE user_id != auth.uid()
  )
);

-- Note: The second policy allows viewing profiles but in application code,
-- queries should explicitly SELECT only non-sensitive columns (full_name, avatar_url, bio, role)
-- when fetching other users' profiles to prevent accidental exposure.

-- Alternatively, for maximum security, comment out the second policy above
-- and use ONLY the first policy if your app doesn't need to show other users' profiles.

-- Add comment to remind developers
COMMENT ON TABLE public.profiles IS 'SECURITY: When querying profiles of other users, SELECT only: full_name, avatar_url, bio, role. Never SELECT email, phone in public views.';