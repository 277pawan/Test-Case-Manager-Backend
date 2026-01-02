-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'tester', -- admin, test-lead, tester, read-only
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active', -- active, archived
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project Members (Many-to-Many)
CREATE TABLE project_members (
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    PRIMARY KEY (project_id, user_id)
);

-- Test Suites Table
CREATE TABLE test_suites (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Test Cases Table
CREATE TABLE test_cases (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    suite_id INTEGER REFERENCES test_suites(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(10) CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    type VARCHAR(20) CHECK (type IN ('Functional', 'Integration', 'Regression', 'Smoke', 'UI', 'API')),
    pre_conditions TEXT,
    post_conditions TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Test Steps Table
CREATE TABLE test_steps (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    action TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Test Executions Table (Represents a run of a test case)
CREATE TABLE test_executions (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    executed_by INTEGER REFERENCES users(id),
    status VARCHAR(10) CHECK (status IN ('Pass', 'Fail', 'Blocked', 'Skipped', 'Pending')),
    actual_result TEXT,
    comments TEXT,
    execution_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_test_cases_project_id ON test_cases(project_id);
CREATE INDEX idx_test_cases_suite_id ON test_cases(suite_id);
CREATE INDEX idx_test_executions_test_case_id ON test_executions(test_case_id);
CREATE INDEX idx_test_executions_executed_by ON test_executions(executed_by);
