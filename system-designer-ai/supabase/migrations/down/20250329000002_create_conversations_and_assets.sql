--migrate:down

-- Drop indexes
DROP INDEX IF EXISTS idx_conversations_project_id;
DROP INDEX IF EXISTS idx_messages_conversation_id;
DROP INDEX IF EXISTS idx_design_assets_project_id;
DROP INDEX IF EXISTS idx_asset_versions_asset_id;
DROP INDEX IF EXISTS idx_exported_prompts_project_id;

-- Drop triggers
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS update_design_assets_updated_at ON design_assets;

-- Drop policies for exported_prompts
DROP POLICY IF EXISTS "Users can view exported_prompts in their projects" ON exported_prompts;
DROP POLICY IF EXISTS "Users can manage exported_prompts in their projects" ON exported_prompts;

-- Drop policies for asset_versions
DROP POLICY IF EXISTS "Users can view asset versions in their projects" ON asset_versions;
DROP POLICY IF EXISTS "Users can create asset versions in their projects" ON asset_versions;

-- Drop policies for design_assets
DROP POLICY IF EXISTS "Users can view design_assets in their projects" ON design_assets;
DROP POLICY IF EXISTS "Users can manage design_assets in their projects" ON design_assets;

-- Drop policies for messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON messages;

-- Drop policies for conversations
DROP POLICY IF EXISTS "Users can view conversations in their projects" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations in their projects" ON conversations;

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS exported_prompts;
DROP TABLE IF EXISTS asset_versions;
DROP TABLE IF EXISTS design_assets;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations; 