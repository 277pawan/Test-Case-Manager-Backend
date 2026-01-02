-- Add test execution permissions table
-- This table tracks which users have permission to execute tests
-- Admins always have permission (checked in application logic)

CREATE TABLE IF NOT EXISTS test_execution_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_execution_permissions_user_id ON test_execution_permissions(user_id);

-- Add comment
COMMENT ON TABLE test_execution_permissions IS 'Tracks which users have permission to execute tests. Admins always have permission.';
