-- Create table for tracking subdeck purchases
CREATE TABLE IF NOT EXISTS public.user_subdeck_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subdeck_id UUID NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount_paid NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subdeck_id)
);

-- Enable RLS
ALTER TABLE public.user_subdeck_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own purchases"
  ON public.user_subdeck_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own purchases (for testing/manual)
CREATE POLICY "Users can insert their own purchases"
  ON public.user_subdeck_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
  ON public.user_subdeck_purchases
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all purchases
CREATE POLICY "Admins can manage all purchases"
  ON public.user_subdeck_purchases
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));