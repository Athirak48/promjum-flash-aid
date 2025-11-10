-- Add RLS policies for sub_decks to allow admins to manage them
CREATE POLICY "Admins can manage all sub_decks"
ON public.sub_decks
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR 
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR 
  has_role(auth.uid(), 'content_editor'::app_role)
);