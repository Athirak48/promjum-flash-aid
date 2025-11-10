-- Update RLS policy for decks to only show published ones to regular users
DROP POLICY IF EXISTS "Anyone can view decks" ON public.decks;

CREATE POLICY "Anyone can view published decks"
ON public.decks
FOR SELECT
TO public
USING (is_published = true);

-- Admins can view all decks including unpublished ones
CREATE POLICY "Admins can view all decks"
ON public.decks
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR 
  has_role(auth.uid(), 'content_editor'::app_role)
);