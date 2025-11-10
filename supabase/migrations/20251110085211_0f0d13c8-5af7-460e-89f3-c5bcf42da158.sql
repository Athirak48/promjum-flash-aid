-- Add is_published column to sub_decks table
ALTER TABLE public.sub_decks 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Add published_at column to track when it was published
ALTER TABLE public.sub_decks 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Update the RLS policy for viewing sub_decks to only show published ones to regular users
DROP POLICY IF EXISTS "Anyone can view sub_decks" ON public.sub_decks;

CREATE POLICY "Anyone can view published sub_decks"
ON public.sub_decks
FOR SELECT
TO public
USING (is_published = true);

-- Admins can view all sub_decks including unpublished ones
CREATE POLICY "Admins can view all sub_decks"
ON public.sub_decks
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR 
  has_role(auth.uid(), 'content_editor'::app_role)
);