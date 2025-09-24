-- First, let's add the new columns to profiles without changing the existing structure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- ตาราง uploads: เก็บข้อมูลไฟล์ที่ผู้ใช้อัปโหลดมา
CREATE TABLE public.uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  original_file_name TEXT NOT NULL,
  original_file_url TEXT NOT NULL,
  file_size_mb INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง flashcards: เก็บข้อมูลแฟลชการ์ดแต่ละใบ
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES public.uploads(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง payments: เก็บประวัติการชำระเงิน
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  upload_id UUID REFERENCES public.uploads(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง pricing_history: เก็บประวัติการเปลี่ยนแปลงราคา
CREATE TABLE public.pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_per_mb DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง game_data: เก็บข้อมูลสถิติการเล่นเกมของแต่ละแฟลชการ์ด
CREATE TABLE public.game_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
  srs_level INTEGER NOT NULL DEFAULT 0,
  last_reviewed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, flashcard_id)
);

-- ตาราง marketplace_cards: เก็บแฟลชการ์ดที่ผู้ใช้ต้องการขาย
CREATE TABLE public.marketplace_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง sales: บันทึกการซื้อขายแฟลชการ์ดใน marketplace
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.marketplace_cards(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง notifications: เก็บการแจ้งเตือนต่างๆ ให้กับผู้ใช้
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for uploads
CREATE POLICY "Users can view their own uploads" ON public.uploads
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uploads" ON public.uploads
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads" ON public.uploads
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for flashcards (viewable by upload owner)
CREATE POLICY "Users can view flashcards from their uploads" ON public.flashcards
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.uploads 
    WHERE uploads.id = flashcards.upload_id 
    AND uploads.user_id = auth.uid()
  )
);

CREATE POLICY "System can create flashcards" ON public.flashcards
FOR INSERT WITH CHECK (true);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON public.payments
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pricing_history (readable by all authenticated users)
CREATE POLICY "Authenticated users can view pricing history" ON public.pricing_history
FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for game_data
CREATE POLICY "Users can view their own game data" ON public.game_data
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game data" ON public.game_data
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game data" ON public.game_data
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for marketplace_cards (public read, owner write)
CREATE POLICY "Anyone can view marketplace cards" ON public.marketplace_cards
FOR SELECT USING (true);

CREATE POLICY "Users can create their own marketplace listings" ON public.marketplace_cards
FOR INSERT WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can update their own marketplace listings" ON public.marketplace_cards
FOR UPDATE USING (auth.uid() = uploader_id);

-- RLS Policies for sales
CREATE POLICY "Users can view sales they are involved in" ON public.sales
FOR SELECT USING (
  auth.uid() = buyer_id OR 
  EXISTS (
    SELECT 1 FROM public.marketplace_cards 
    WHERE marketplace_cards.id = sales.card_id 
    AND marketplace_cards.uploader_id = auth.uid()
  )
);

CREATE POLICY "Users can create sales as buyers" ON public.sales
FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_uploads_updated_at
BEFORE UPDATE ON public.uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_cards_updated_at
BEFORE UPDATE ON public.marketplace_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();