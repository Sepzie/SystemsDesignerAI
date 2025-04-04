-- migrate:up
-- Create assets table
CREATE TABLE assets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('mermaid_diagram', 'project_description', 'roadmap', 'tech_doc', 'prompt')),
    content text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create index on project_id for faster joins and lookups
CREATE INDEX idx_assets_project_id ON assets(project_id);

-- Create asset_versions table
CREATE TABLE asset_versions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id uuid REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
    version_number integer NOT NULL,
    content text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
); 

-- Create index on asset_id for faster joins and lookups
CREATE INDEX idx_asset_versions_asset_id ON asset_versions(asset_id);   

-- Add RLS policies for assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage (CRUD) assets in their projects"
    ON assets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Add RLS policies for asset_versions
ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view asset versions in their projects"
    ON asset_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assets
            JOIN projects ON projects.id = assets.project_id
            WHERE assets.id = asset_versions.asset_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create asset versions in their projects"
    ON asset_versions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assets
            JOIN projects ON projects.id = assets.project_id
            WHERE assets.id = asset_versions.asset_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete asset versions in their projects"
    ON asset_versions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM assets
            JOIN projects ON projects.id = assets.project_id
            WHERE assets.id = asset_versions.asset_id
            AND projects.user_id = auth.uid()
        )
    );

-- Add trigger for updated_at
CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Create function to handle versioning before content updates
CREATE OR REPLACE FUNCTION create_asset_version_before_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create a new version if the content has changed
    IF OLD.content IS DISTINCT FROM NEW.content THEN
        -- Get the next version number
        INSERT INTO asset_versions (
            asset_id,
            version_number,
            content,
            metadata
        )
        VALUES (
            OLD.id,
            COALESCE(
                (SELECT MAX(version_number) + 1 
                 FROM asset_versions 
                 WHERE asset_id = OLD.id),
                1
            ),
            OLD.content,
            OLD.metadata
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the versioning function before updates
CREATE TRIGGER create_asset_version_before_update
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION create_asset_version_before_update();



