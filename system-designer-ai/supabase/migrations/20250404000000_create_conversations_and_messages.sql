-- migrate:up
-- Create conversations table
CREATE TABLE conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create index on project_id for faster joins and lookups
CREATE INDEX idx_conversations_project_id ON conversations(project_id);

-- Create messages table
CREATE TABLE messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    referenced_assets uuid[] DEFAULT '{}',
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create index on conversation_id for faster joins and lookups
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Create index on created_at for time-based queries
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Add RLS policies for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations in their projects"
    ON conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = conversations.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations in their projects"
    ON conversations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = conversations.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Add RLS policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            JOIN projects ON projects.id = conversations.project_id
            WHERE conversations.id = messages.conversation_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their conversations"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            JOIN projects ON projects.id = conversations.project_id
            WHERE conversations.id = messages.conversation_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in their conversations"
    ON messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            JOIN projects ON projects.id = conversations.project_id
            WHERE conversations.id = messages.conversation_id
            AND projects.user_id = auth.uid()
        )
    );

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

-- Add trigger for updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

