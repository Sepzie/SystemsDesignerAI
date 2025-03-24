-- Create functions for handling timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create tables for AI System Designer

-- Users table
CREATE TABLE "User" (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON "User"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON "User"
  FOR UPDATE USING (auth.uid() = id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON "User"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Projects table
CREATE TABLE "Project" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB DEFAULT '{}',
  tech_stack TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can CRUD their own projects" ON "Project"
  FOR ALL USING (auth.uid() = user_id);

-- Create trigger for Project table
CREATE TRIGGER update_project_updated_at
BEFORE UPDATE ON "Project"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Design Assets table
CREATE TABLE "DesignAsset" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "DesignAsset" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can CRUD their own design assets" ON "DesignAsset"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Project" WHERE "Project".id = "DesignAsset".project_id AND "Project".user_id = auth.uid()
    )
  );

-- Create trigger for DesignAsset table
CREATE TRIGGER update_design_asset_updated_at
BEFORE UPDATE ON "DesignAsset"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Asset Versions table
CREATE TABLE "AssetVersion" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES "DesignAsset"(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE "AssetVersion" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can CRUD their own asset versions" ON "AssetVersion"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "DesignAsset"
      JOIN "Project" ON "Project".id = "DesignAsset".project_id
      WHERE "DesignAsset".id = "AssetVersion".asset_id AND "Project".user_id = auth.uid()
    )
  );

-- Conversations table
CREATE TABLE "Conversation" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can CRUD their own conversations" ON "Conversation"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Project" WHERE "Project".id = "Conversation".project_id AND "Project".user_id = auth.uid()
    )
  );

-- Create trigger for Conversation table
CREATE TRIGGER update_conversation_updated_at
BEFORE UPDATE ON "Conversation"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Messages table
CREATE TABLE "Message" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES "Conversation"(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can CRUD their own messages" ON "Message"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Conversation"
      JOIN "Project" ON "Project".id = "Conversation".project_id
      WHERE "Conversation".id = "Message".conversation_id AND "Project".user_id = auth.uid()
    )
  );

-- Exported Prompts table
CREATE TABLE "ExportedPrompt" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "ExportedPrompt" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can CRUD their own exported prompts" ON "ExportedPrompt"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Project" WHERE "Project".id = "ExportedPrompt".project_id AND "Project".user_id = auth.uid()
    )
  );

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema'; 