-- Create feedback table for general user feedback
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('dashboard', 'deck', 'feature', 'flashcard', 'general')),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'suggestion', 'complaint', 'compliment')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  email TEXT,
  contact_permission BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback
CREATE POLICY "Users can insert their own feedback"
ON public.feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all feedback"
ON public.feedback
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create promotions table
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  description TEXT,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promotions
CREATE POLICY "Anyone can view active promotions"
ON public.promotions
FOR SELECT
TO authenticated
USING (is_active = true AND now() BETWEEN valid_from AND valid_until);

CREATE POLICY "Admins can manage promotions"
ON public.promotions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create subscriptions table for member management
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'monthly', 'yearly', 'lifetime')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  price_paid NUMERIC,
  promotion_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all subscriptions"
ON public.subscriptions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_feedback_category ON public.feedback(category);
CREATE INDEX idx_feedback_status ON public.feedback(status);
CREATE INDEX idx_promotions_code ON public.promotions(code);
CREATE INDEX idx_promotions_active ON public.promotions(is_active);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);