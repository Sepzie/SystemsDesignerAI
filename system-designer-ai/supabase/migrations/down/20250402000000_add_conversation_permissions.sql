-- migrate:down
-- Drop update and delete permissions
DROP POLICY IF EXISTS "Users can update conversations in their projects" ON conversations;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can delete conversations in their projects" ON conversations;

-- Revert message_id to be required in asset_references
ALTER TABLE asset_references
DROP CONSTRAINT asset_references_message_id_fkey,
ADD CONSTRAINT asset_references_message_id_fkey 
    FOREIGN KEY (message_id) 
    REFERENCES messages(id) 
    ON DELETE CASCADE,
ALTER COLUMN message_id SET NOT NULL; 