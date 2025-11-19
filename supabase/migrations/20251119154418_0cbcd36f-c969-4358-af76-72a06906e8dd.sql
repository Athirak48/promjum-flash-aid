-- Create user_decks table for user-created decks
CREATE TABLE IF NOT EXISTS public.user_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.user_folders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'BookOpen',
  card_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subdecks table for user-created subdecks
CREATE TABLE IF NOT EXISTS public.user_subdecks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES public.user_decks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT DEFAULT 'beginner',
  card_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add subdeck_id column to user_flashcards (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_flashcards' 
    AND column_name = 'subdeck_id'
  ) THEN
    ALTER TABLE public.user_flashcards 
    ADD COLUMN subdeck_id UUID REFERENCES public.user_subdecks(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on user_decks
ALTER TABLE public.user_decks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_decks
CREATE POLICY "Users can manage their own decks"
  ON public.user_decks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all user decks"
  ON public.user_decks
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Enable RLS on user_subdecks
ALTER TABLE public.user_subdecks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_subdecks
CREATE POLICY "Users can manage their own subdecks"
  ON public.user_subdecks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all user subdecks"
  ON public.user_subdecks
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_decks_user_id ON public.user_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_decks_folder_id ON public.user_decks(folder_id);
CREATE INDEX IF NOT EXISTS idx_user_subdecks_user_id ON public.user_subdecks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subdecks_deck_id ON public.user_subdecks(deck_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcards_subdeck_id ON public.user_flashcards(subdeck_id);

-- Create trigger to update updated_at column for user_decks
CREATE TRIGGER update_user_decks_updated_at
  BEFORE UPDATE ON public.user_decks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update updated_at column for user_subdecks
CREATE TRIGGER update_user_subdecks_updated_at
  BEFORE UPDATE ON public.user_subdecks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();