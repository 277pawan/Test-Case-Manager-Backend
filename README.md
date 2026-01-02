# Test Case Manager - Backend

A comprehensive test case management system with role-based access control, execution permissions, and project visibility filtering.

## 🚀 Features

### Core Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Test Lead, Tester, Read-only)
  - Secure password hashing

- **Project Management**
  - Create, update, and delete projects
  - Project version tracking
  - Status management (Active/Archived)
  - Automatic cache invalidation

- **Test Case Management**
  - Complete CRUD operations for test cases
  - Test case assignment to users
  - Priority levels (Low, Medium, High, Critical)
  - Test types (Functional, Integration, Regression, Smoke, UI, API)
  - Pre/Post conditions support
  - Test steps management
  - Soft delete functionality
  - Reopen passed test cases (Admin only)

- **Test Execution**
  - Execute tests with detailed results
  - Status tracking (Pass, Fail, Blocked, Skipped, Pending)
  - Execution history
  - Permission-based execution control

- **Permission System**
  - **Test Execution Permissions**: Grant/revoke global execution rights
  - **Project Visibility**: Role-based project filtering
    - Admins see all projects
    - Users see only projects where they're assigned to test cases

- **Analytics & Reporting**
  - Project statistics
  - Test case metrics
  - Execution analytics by status
  - Priority distribution

- **Caching**
  - Redis-based caching for improved performance
  - Automatic cache invalidation on data updates

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Security**: Helmet, bcryptjs
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Redis
- npm or yarn

## ⚙️ Installation

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**
   Create a `.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/testcasemanager
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
```

3. **Set up database**
   Run the database schema:

```bash
psql -U username -d testcasemanager -f database.sql
```

4. **Run migrations**

```bash
node run-migration.js
```

5. **Build and start**

```bash
npm run build
npm start
```

For development:

```bash
npm run dev
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Projects

- `GET /api/projects` - Get all projects (filtered by role)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project (Admin/Test Lead)
- `PUT /api/projects/:id` - Update project (Admin/Test Lead)
- `DELETE /api/projects/:id` - Delete project (Admin)

### Test Cases

- `GET /api/test-cases` - Get test cases (with filters)
- `GET /api/test-cases/:id` - Get test case by ID
- `GET /api/test-cases/passed` - Get closed test cases
- `POST /api/test-cases` - Create test case
- `PATCH /api/test-case-status/:id/reopen` - Reopen test case (Admin)

### Test Execution

- `POST /api/test-executions` - Execute a test
- `GET /api/test-executions` - Get execution history

### Execution Permissions

- `POST /api/execution-permissions/grant` - Grant execution permission (Admin)
- `DELETE /api/execution-permissions/revoke/:userId` - Revoke permission (Admin)
- `GET /api/execution-permissions` - Get all permitted users
- `GET /api/execution-permissions/check` - Check current user permission

### Users

- `GET /api/users` - Get all users (for assignment dropdown)

### Analytics

- `GET /api/analytics` - Get dashboard analytics

## 🔐 User Roles & Permissions

### Admin

- Full system access
- Can create/edit/delete projects
- Can grant/revoke execution permissions
- Can reopen passed test cases
- Sees all projects

### Test Lead

- Can create projects
- Can create/edit test cases
- Can execute tests (if granted permission)
- Sees assigned projects

### Tester

- Can create/edit test cases
- Can execute tests (if granted permission)
- Sees assigned projects

### Read-only

- View-only access
- Cannot modify anything

## 📊 Database Schema

### Main Tables

- `users` - User accounts and roles
- `projects` - Test projects
- `test_suites` - Test suite organization
- `test_cases` - Test case definitions (with `assigned_to`)
- `test_steps` - Test case execution steps
- `test_executions` - Test execution records
- `test_execution_permissions` - Global execution permissions

## 🔄 Cache Strategy

- **Projects List**: Cached for 1 hour (admins only)
- **Analytics**: Cached for 5 minutes
- **Automatic Invalidation**: On create/update/delete operations

Clear Redis cache:

```bash
redis-cli FLUSHALL
```

## 📝 Migration Scripts

- `add_test_case_status.sql` - Adds status column to test_cases
- `add_execution_permissions.sql` - Creates execution permissions table
- `add_assigned_to_column.sql` - Adds assigned_to for project visibility

## 📄 License

MIT
