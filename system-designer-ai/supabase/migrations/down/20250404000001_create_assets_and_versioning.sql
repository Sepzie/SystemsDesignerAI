-- migrate:down
-- Drop triggers first
DROP TRIGGER IF EXISTS create_asset_version_before_update ON assets;
DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;

-- Drop function
DROP FUNCTION IF EXISTS create_asset_version_before_update();

-- Drop policies for asset_versions
DROP POLICY IF EXISTS "Users can delete asset versions in their projects" ON asset_versions;
DROP POLICY IF EXISTS "Users can create asset versions in their projects" ON asset_versions;
DROP POLICY IF EXISTS "Users can view asset versions in their projects" ON asset_versions;

-- Drop policies for assets
DROP POLICY IF EXISTS "Users can manage (CRUD) assets in their projects" ON assets;

-- Drop indexes
DROP INDEX IF EXISTS idx_asset_versions_asset_id;
DROP INDEX IF EXISTS idx_assets_project_id;
DROP INDEX IF EXISTS idx_assets_project_semantic_id;

-- Drop tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS asset_versions;
DROP TABLE IF EXISTS assets; 