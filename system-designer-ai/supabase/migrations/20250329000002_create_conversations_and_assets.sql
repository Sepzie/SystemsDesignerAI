-- migrate:up
-- Create conversations table
CREATE TABLE conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title text,
    started_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Create design_assets table
CREATE TABLE design_assets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    asset_type text NOT NULL CHECK (asset_type IN ('mermaid_diagram', 'project_description', 'roadmap', 'tech_doc', 'prompt')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create asset_versions table
CREATE TABLE asset_versions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id uuid REFERENCES design_assets(id) ON DELETE CASCADE,
    version_number text NOT NULL,
    content text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    created_by text
);

-- Create exported_prompts table
CREATE TABLE exported_prompts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    content text NOT NULL,
    prompt_type text,
    created_at timestamptz DEFAULT now()
);

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

-- Add RLS policies for design_assets
ALTER TABLE design_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view design_assets in their projects"
    ON design_assets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = design_assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage design_assets in their projects"
    ON design_assets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = design_assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Add RLS policies for asset_versions
ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view asset versions in their projects"
    ON asset_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM design_assets
            JOIN projects ON projects.id = design_assets.project_id
            WHERE design_assets.id = asset_versions.asset_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create asset versions in their projects"
    ON asset_versions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM design_assets
            JOIN projects ON projects.id = design_assets.project_id
            WHERE design_assets.id = asset_versions.asset_id
            AND projects.user_id = auth.uid()
        )
    );

-- Add RLS policies for exported_prompts
ALTER TABLE exported_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exported_prompts in their projects"
    ON exported_prompts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = exported_prompts.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage exported_prompts in their projects"
    ON exported_prompts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = exported_prompts.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Add triggers for updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_assets_updated_at
    BEFORE UPDATE ON design_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_design_assets_project_id ON design_assets(project_id);
CREATE INDEX idx_asset_versions_asset_id ON asset_versions(asset_id);
CREATE INDEX idx_exported_prompts_project_id ON exported_prompts(project_id); 