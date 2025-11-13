-- Create user_folders table for storing user-created folders
CREATE TABLE public.user_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  card_sets_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_flashcard_sets table for flashcard sets within folders
CREATE TABLE public.user_flashcard_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES public.user_folders(id) ON DELETE SET NULL,
  title text NOT NULL,
  card_count integer DEFAULT 0,
  source text NOT NULL DEFAULT 'created',
  last_reviewed timestamp with time zone,
  next_review timestamp with time zone,
  progress integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_flashcards table for individual flashcards
CREATE TABLE public.user_flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_set_id uuid NOT NULL REFERENCES public.user_flashcard_sets(id) ON DELETE CASCADE,
  front_text text NOT NULL,
  back_text text NOT NULL,
  front_image_url text,
  back_image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_folders
CREATE POLICY "Users can manage their own folders"
  ON public.user_folders
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_flashcard_sets
CREATE POLICY "Users can manage their own flashcard sets"
  ON public.user_flashcard_sets
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_flashcards
CREATE POLICY "Users can manage their own flashcards"
  ON public.user_flashcards
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_folders_user_id ON public.user_folders(user_id);
CREATE INDEX idx_user_flashcard_sets_user_id ON public.user_flashcard_sets(user_id);
CREATE INDEX idx_user_flashcard_sets_folder_id ON public.user_flashcard_sets(folder_id);
CREATE INDEX idx_user_flashcards_user_id ON public.user_flashcards(user_id);
CREATE INDEX idx_user_flashcards_set_id ON public.user_flashcards(flashcard_set_id);

-- Add triggers for updated_at
CREATE TRIGGER update_user_folders_updated_at
  BEFORE UPDATE ON public.user_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_flashcard_sets_updated_at
  BEFORE UPDATE ON public.user_flashcard_sets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_flashcards_updated_at
  BEFORE UPDATE ON public.user_flashcards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();