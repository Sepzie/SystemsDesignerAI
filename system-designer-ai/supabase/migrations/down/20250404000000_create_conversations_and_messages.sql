-- migrate:down
-- Drop triggers first
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;

-- Drop policies for messages
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

-- Drop policies for conversations
DROP POLICY IF EXISTS "Users can delete conversations in their projects" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations in their projects" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations in their projects" ON conversations;
DROP POLICY IF EXISTS "Users can view conversations in their projects" ON conversations;

-- Drop indexes
DROP INDEX IF EXISTS idx_messages_created_at;
DROP INDEX IF EXISTS idx_messages_conversation_id;
DROP INDEX IF EXISTS idx_conversations_project_id;

-- Drop tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations; 