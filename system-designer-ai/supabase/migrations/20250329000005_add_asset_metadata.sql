-- migrate:up
-- Add metadata column to assets table
ALTER TABLE assets
ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;

-- migrate:down
-- Remove metadata column from assets table
ALTER TABLE assets
DROP COLUMN metadata; 