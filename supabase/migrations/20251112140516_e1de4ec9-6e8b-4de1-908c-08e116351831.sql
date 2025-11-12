-- Add is_blocked field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_blocked boolean DEFAULT false;

-- Add blocked_at timestamp to track when user was blocked
ALTER TABLE public.profiles 
ADD COLUMN blocked_at timestamp with time zone DEFAULT NULL;

-- Add blocked_reason to store why user was blocked
ALTER TABLE public.profiles 
ADD COLUMN blocked_reason text DEFAULT NULL;

-- Create index for faster blocked user queries
CREATE INDEX idx_profiles_is_blocked ON public.profiles(is_blocked);

-- Add comment to document the field
COMMENT ON COLUMN public.profiles.is_blocked IS 'Indicates if user account is blocked from accessing the system';
COMMENT ON COLUMN public.profiles.blocked_at IS 'Timestamp when user was blocked';
COMMENT ON COLUMN public.profiles.blocked_reason IS 'Reason why user was blocked (for admin reference)';
