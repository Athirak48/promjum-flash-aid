-- Only drop the overly permissive policies (the secure ones already exist)
DROP POLICY IF EXISTS "Admin update access" ON public.system_settings;
DROP POLICY IF EXISTS "Public read access" ON public.system_settings;