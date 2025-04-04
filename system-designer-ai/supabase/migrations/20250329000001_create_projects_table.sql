-- migrate:up
-- Create projects table
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    tech_stack text,
    progress int,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own projects
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to create projects for themselves
CREATE POLICY "Users can create projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own projects
CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own projects
CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add index for user_id
CREATE INDEX idx_projects_user_id ON projects(user_id); 