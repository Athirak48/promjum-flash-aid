-- Create system_settings table for storing admin configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Add description column if it doesn't exist
ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.system_settings;

-- Admins can view all settings
CREATE POLICY "Admins can view settings"
ON public.system_settings FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Admins can insert settings
CREATE POLICY "Admins can insert settings"
ON public.system_settings FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Admins can update settings
CREATE POLICY "Admins can update settings"
ON public.system_settings FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);

-- Insert default settings (without description to avoid error)
INSERT INTO public.system_settings (key, value) VALUES
('general', '{"site_name": "Promjum Flash Aid", "site_description": "แอปพลิเคชันเรียนรู้คำศัพท์ด้วย Flashcard และเกมสนุกๆ", "contact_email": "support@promjum.com", "support_phone": "02-xxx-xxxx"}'),
('features', '{"ai_features": true, "vocab_challenge": true, "multiplayer": false, "dark_mode": true, "christmas_theme": false, "new_games": false, "beta_features": false}'),
('notifications', '{"email_notifications": true, "push_notifications": true, "marketing_emails": false, "weekly_digest": true}'),
('maintenance', '{"enabled": false, "message": "ระบบกำลังปรับปรุง กรุณากลับมาใหม่ภายหลัง", "end_time": null}')
ON CONFLICT (key) DO NOTHING;
