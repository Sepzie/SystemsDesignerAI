-- migrate:up
-- Add metadata column to assets table
ALTER TABLE assets
ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;

-- Add RLS policy for asset_references table to allow inserting new references
ALTER TABLE asset_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow inserting asset references" 
ON asset_references
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- migrate:down
-- Remove RLS policy for asset_references table
DROP POLICY IF EXISTS "Allow inserting asset references" ON asset_references;

-- Remove metadata column from assets table
ALTER TABLE assets
DROP COLUMN metadata; 