-- Add display_order column to decks table
ALTER TABLE decks 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Initialize display_order based on created_at
UPDATE decks 
SET display_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 as row_num
  FROM decks
) as subquery
WHERE decks.id = subquery.id;