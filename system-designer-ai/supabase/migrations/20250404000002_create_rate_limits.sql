-- migrate:up
CREATE TABLE rate_limits (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date date NOT NULL,
    count integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (user_id, date)
);

CREATE INDEX idx_rate_limits_user_date ON rate_limits(user_id, date);

CREATE TABLE global_rate_limits (
    date date PRIMARY KEY,
    count integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE rate_limit_hits (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
    conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
    message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
    limit_type text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rate_limit_hits_user_id ON rate_limit_hits(user_id);
CREATE INDEX idx_rate_limit_hits_created_at ON rate_limit_hits(created_at);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_hits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits"
    ON rate_limits FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage global rate limits"
    ON global_rate_limits FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage rate limit hits"
    ON rate_limit_hits FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_rate_limits_updated_at
    BEFORE UPDATE ON rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_rate_limits_updated_at
    BEFORE UPDATE ON global_rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
