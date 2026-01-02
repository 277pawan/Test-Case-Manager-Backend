-- Add status column to test_cases table
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';

-- Set all existing test cases to 'open' status
UPDATE test_cases SET status = 'open' WHERE status IS NULL;

-- Add comment
COMMENT ON COLUMN test_cases.status IS 'Test case status: open (can be executed) or closed (passed, locked for non-admins)';
