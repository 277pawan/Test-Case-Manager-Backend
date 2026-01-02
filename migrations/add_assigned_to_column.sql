-- Add assigned_to column to test_cases table
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_test_cases_assigned_to ON test_cases(assigned_to);

-- Add comment
COMMENT ON COLUMN test_cases.assigned_to IS 'User assigned to execute this test case';
