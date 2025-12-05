-- Add policy for admins to view all user flashcard progress
CREATE POLICY "Admins can view all user flashcard progress" 
ON public.user_flashcard_progress 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));