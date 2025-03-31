-- migrate:down
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Enable insert for service role only" ON users;
DROP TABLE IF EXISTS users;
DROP FUNCTION IF EXISTS update_updated_at_column();