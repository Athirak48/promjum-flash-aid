-- Add comment column to feature_reviews table
ALTER TABLE public.feature_reviews 
ADD COLUMN comment text;