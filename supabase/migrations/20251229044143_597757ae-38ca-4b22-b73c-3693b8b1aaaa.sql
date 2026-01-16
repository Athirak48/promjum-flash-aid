-- Fix: Change DELETE policy from RESTRICTIVE to PERMISSIVE for sub_decks
DROP POLICY IF EXISTS "Users can delete their own decks" ON public.sub_decks;

CREATE POLICY "Users can delete their own decks"
ON public.sub_decks
FOR DELETE
TO authenticated
USING (auth.uid() = creator_user_id);