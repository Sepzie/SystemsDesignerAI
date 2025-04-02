-- migrate:up
-- Add update permissions for conversations
CREATE POLICY "Users can update conversations in their projects"
    ON conversations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = conversations.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Add delete permissions for messages
CREATE POLICY "Users can delete messages in their conversations"
    ON messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            JOIN projects ON projects.id = conversations.project_id
            WHERE conversations.id = messages.conversation_id
            AND projects.user_id = auth.uid()
        )
    );

-- Add delete permissions for conversations
CREATE POLICY "Users can delete conversations in their projects"
    ON conversations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = conversations.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Make message_id nullable in asset_references
ALTER TABLE asset_references
ALTER COLUMN message_id DROP NOT NULL,
DROP CONSTRAINT asset_references_message_id_fkey,
ADD CONSTRAINT asset_references_message_id_fkey 
    FOREIGN KEY (message_id) 
    REFERENCES messages(id) 
    ON DELETE SET NULL; 