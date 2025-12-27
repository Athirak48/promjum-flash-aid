-- Update notifications table to support broadcast and admin notifications
-- Add new columns for admin notification features

-- Add columns for broadcast notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'in_app' CHECK (type IN ('push', 'email', 'in_app')),
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'individual' CHECK (target_audience IN ('all', 'premium', 'free', 'individual')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'scheduled', 'draft')),
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create a broadcasts table for admin-sent notifications (sent to multiple users)
CREATE TABLE IF NOT EXISTS notification_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'in_app' CHECK (type IN ('push', 'email', 'in_app')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'premium', 'free')),
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'scheduled', 'draft')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    read_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a table to track which users received/read which broadcast
CREATE TABLE IF NOT EXISTS notification_broadcast_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id UUID NOT NULL REFERENCES notification_broadcasts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(broadcast_id, user_id)
);

-- Enable RLS
ALTER TABLE notification_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_broadcast_recipients ENABLE ROW LEVEL SECURITY;

-- Admins can view all broadcasts
CREATE POLICY "Admins can view broadcasts"
ON notification_broadcasts FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Admins can create broadcasts
CREATE POLICY "Admins can create broadcasts"
ON notification_broadcasts FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Admins can update broadcasts
CREATE POLICY "Admins can update broadcasts"
ON notification_broadcasts FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Admins can delete broadcasts
CREATE POLICY "Admins can delete broadcasts"
ON notification_broadcasts FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Users can view their own broadcast recipients
CREATE POLICY "Users can view own recipients"
ON notification_broadcast_recipients FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all broadcast recipients
CREATE POLICY "Admins can view all recipients"
ON notification_broadcast_recipients FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Admins can insert broadcast recipients
CREATE POLICY "Admins can insert recipients"
ON notification_broadcast_recipients FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Users can update their own recipient record (mark as read)
CREATE POLICY "Users can update own recipients"
ON notification_broadcast_recipients FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_broadcasts_status ON notification_broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_notification_broadcasts_created_at ON notification_broadcasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_user ON notification_broadcast_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_broadcast ON notification_broadcast_recipients(broadcast_id);
