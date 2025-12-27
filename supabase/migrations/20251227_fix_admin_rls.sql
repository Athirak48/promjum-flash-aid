-- Migration: Fix Admin RLS Policy for Analytics
-- Created: 2025-12-27
-- Description: Updates RLS policy for user_activity_logs to check user_roles table instead of profiles, matching AdminRoute logic.

-- Drop existing policy if it exists (try/catch style not needed if we know the name)
DROP POLICY IF EXISTS "Admins can view all activity" ON public.user_activity_logs;

-- Create new policy checking user_roles
CREATE POLICY "Admins can view all activity"
  ON public.user_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Also fix daily_analytics policies just in case
DROP POLICY IF EXISTS "Admins can view daily analytics" ON public.daily_analytics;
CREATE POLICY "Admins can view daily analytics"
  ON public.daily_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
     OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can modify daily analytics" ON public.daily_analytics;
CREATE POLICY "Admins can modify daily analytics"
  ON public.daily_analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
     OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
