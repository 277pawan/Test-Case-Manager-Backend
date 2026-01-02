# Render Deployment Guide

## Environment Variables

Set these in Render dashboard:

```env
PORT=5000
DATABASE_URL=your-postgres-connection-string
REDIS_URL=your-redis-connection-string
JWT_SECRET=your-secret-key
NODE_ENV=production
```

## Build Command

```bash
npm install
```

The `postinstall` script will automatically run `npm run build`

## Start Command

```bash
npm start
```

## Database Setup

After deployment, run migrations:

1. Connect to your Render shell
2. Run: `node run-migration.js`

## Common Issues

### TypeScript Build Errors
- Make sure `typescript` is in `dependencies`, not `devDependencies`
- Render needs it to build the project

### Module Not Found
- Ensure `postinstall` script runs `npm run build`
- Check that `dist/` folder is created

### Database Connection
- Verify DATABASE_URL is set correctly
- Ensure PostgreSQL addon is connected

### Redis Connection
- Verify REDIS_URL is set correctly
- Ensure Redis addon is connected
