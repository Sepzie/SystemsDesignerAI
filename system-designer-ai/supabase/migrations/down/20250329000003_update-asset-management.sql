-- migrate:down
-- Drop indexes
DROP INDEX IF EXISTS idx_asset_references_message_id;
DROP INDEX IF EXISTS idx_asset_references_asset_id;

-- Rename index back
ALTER INDEX idx_assets_project_id RENAME TO idx_design_assets_project_id;

-- Drop asset_references table and its policies
DROP POLICY IF EXISTS "Users can view asset references in their projects" ON asset_references;
DROP POLICY IF EXISTS "Users can create asset references in their projects" ON asset_references;
DROP TABLE IF EXISTS asset_references;

-- Recreate exported_prompts table
CREATE TABLE exported_prompts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    content text NOT NULL,
    prompt_type text,
    created_at timestamptz DEFAULT now()
);

-- Add back RLS policies for exported_prompts
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

-- Revert asset_versions table changes
ALTER TABLE asset_versions
DROP COLUMN created_by_message_id,
ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb,
ADD COLUMN created_by text,
ALTER COLUMN version_number TYPE text;

-- Revert assets table changes
ALTER TABLE assets
DROP COLUMN current_content,
DROP COLUMN current_version;

-- Rename assets table back to assets
ALTER TABLE assets
RENAME TO assets;

-- Revert projects table changes
ALTER TABLE projects
DROP COLUMN metadata,
ADD COLUMN requirements jsonb DEFAULT '{}'::jsonb,
ADD COLUMN tech_stack text,
ADD COLUMN progress text; 