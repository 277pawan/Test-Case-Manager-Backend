import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectRedis } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import testSuiteRoutes from './routes/testSuiteRoutes';
import testCaseRoutes from './routes/testCaseRoutes';
import testExecutionRoutes from './routes/testExecutionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import testCaseStatusRoutes from './routes/testCaseStatusRoutes';
import executionPermissionRoutes from './routes/executionPermissionRoutes';
import userRoutes from './routes/userRoutes';

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/test-suites', testSuiteRoutes);
app.use('/api/test-cases', testCaseRoutes);
app.use('/api/test-case-status', testCaseStatusRoutes);
app.use('/api/test-executions', testExecutionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/execution-permissions', executionPermissionRoutes);
app.use('/api/users', userRoutes);

// Start Server
const startServer = async () => {
    await connectRedis();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} - VERSION CHECK: Fixed Projects SQL`);
    });
};

startServer();
