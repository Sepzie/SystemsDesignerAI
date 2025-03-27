-- Drop existing tables if they exist (BE CAREFUL DURING PRODUCTION)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS exported_prompts CASCADE;
DROP TABLE IF EXISTS asset_versions CASCADE;
DROP TABLE IF EXISTS design_assets CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB DEFAULT '{}',
  tech_stack TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
CREATE POLICY "Users can CRUD their own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Design Assets table
CREATE TABLE design_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE design_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for design_assets table
CREATE POLICY "Users can CRUD their own design assets" ON design_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = design_assets.project_id AND projects.user_id = auth.uid()
    )
  );

-- Asset Versions table
CREATE TABLE asset_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES design_assets(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for asset_versions table
CREATE POLICY "Users can CRUD their own asset versions" ON asset_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM design_assets
      JOIN projects ON projects.id = design_assets.project_id
      WHERE design_assets.id = asset_versions.asset_id AND projects.user_id = auth.uid()
    )
  );

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations table
CREATE POLICY "Users can CRUD their own conversations" ON conversations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = conversations.project_id AND projects.user_id = auth.uid()
    )
  );

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages table
CREATE POLICY "Users can CRUD their own messages" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations
      JOIN projects ON projects.id = conversations.project_id
      WHERE conversations.id = messages.conversation_id AND projects.user_id = auth.uid()
    )
  );

-- Exported Prompts table
CREATE TABLE exported_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE exported_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for exported_prompts table
CREATE POLICY "Users can CRUD their own exported prompts" ON exported_prompts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = exported_prompts.project_id AND projects.user_id = auth.uid()
    )
  );

-- Create functions for handling timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_project_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_asset_updated_at
BEFORE UPDATE ON design_assets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 