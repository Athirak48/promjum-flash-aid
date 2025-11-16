-- Add admin policies for user flashcard tables

-- Allow admins to view all user folders
CREATE POLICY "Admins can view all user folders"
ON public.user_folders
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to view all user flashcard sets
CREATE POLICY "Admins can view all user flashcard sets"
ON public.user_flashcard_sets
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to view all user flashcards
CREATE POLICY "Admins can view all user flashcards"
ON public.user_flashcards
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
);