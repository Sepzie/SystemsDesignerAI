-- migrate:up
-- Update projects table
ALTER TABLE projects
ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;

-- Update assets table to match Asset in diagram
ALTER TABLE assets
RENAME TO assets;

ALTER TABLE assets
ADD COLUMN current_content text,
ADD COLUMN current_version integer DEFAULT 1;

-- Update asset_versions table
ALTER TABLE asset_versions
DROP COLUMN metadata,
DROP COLUMN created_by,
ALTER COLUMN version_number TYPE integer USING version_number::integer,
ADD COLUMN created_by_message_id uuid NOT NULL REFERENCES messages(id);

-- Create asset_references table
CREATE TABLE asset_references (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    version_referenced integer NOT NULL,
    reference_type text NOT NULL CHECK (reference_type IN ('creation', 'modification', 'mention'))
);

-- Drop exported_prompts table as it's not in the diagram
DROP TABLE exported_prompts;

-- Add RLS policies for asset_references
ALTER TABLE asset_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view asset references in their projects"
    ON asset_references FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages
            JOIN conversations ON conversations.id = messages.conversation_id
            JOIN projects ON projects.id = conversations.project_id
            WHERE messages.id = asset_references.message_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create asset references in their projects"
    ON asset_references FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages
            JOIN conversations ON conversations.id = messages.conversation_id
            JOIN projects ON projects.id = conversations.project_id
            WHERE messages.id = asset_references.message_id
            AND projects.user_id = auth.uid()
        )
    );

-- Add indexes for the new table
CREATE INDEX idx_asset_references_message_id ON asset_references(message_id);
CREATE INDEX idx_asset_references_asset_id ON asset_references(asset_id);

-- Rename index to match new table name
ALTER INDEX idx_design_assets_project_id RENAME TO idx_assets_project_id;