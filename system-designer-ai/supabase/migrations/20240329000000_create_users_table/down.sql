-- Drop trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Drop table
DROP TABLE IF EXISTS users; 