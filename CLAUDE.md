# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack chat application with separate frontend and backend:

- **Frontend**: React + TypeScript + Vite (port configured via Vite)
- **Backend**: Node.js + Express + TypeScript + MongoDB (port from .env)

Both use ES modules (`"type": "module"` in package.json) and require `.js` extensions in import statements despite being TypeScript.

## Development Commands

### Backend

```bash
cd backend

# Build TypeScript to JavaScript
npm run dev

# Run the compiled server (requires prior build)
npm start

# Build and run in one step
npm run dev && npm start
```

### Frontend

```bash
cd frontend

# Start development server with HMR
npm run dev

# Build for production
npm run build

# Lint the codebase
npm run lint

# Preview production build
npm run preview
```

## Environment Configuration

The backend requires these environment variables in `backend/.env`:

- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB_NAME` - Database name
- `NODE_ENV` - Environment (development/staging/production)
- `PORT` - Server port
- `RESEND_API_KEY` - Email service API key
- `RESEND_FROM_EMAIL` - Sender email address
- `JWT_SECRET` - JWT signing secret
- `ARCJET_KEY` - Arcjet security service key
- `ARCJET_ENV` - Arcjet environment
- `VERIFICATION_CODE_TTL_MINUTES` - Email verification code TTL

Reference `backend/.env.sample` for the template. The app validates all required vars at startup (`backend/src/env.ts`) and fails fast if any are missing.

## Architecture Overview

### Backend Architecture

**Entry Point**: `backend/src/server.ts`

The server uses a layered architecture:

1. **Middleware Chain** (applied to routes in order):

   - `arcjetMiddleware` - Rate limiting, bot detection, and shield protection (always first)
   - `authMiddleware` - JWT authentication via HTTP-only cookies (protected routes only)

2. **Route Structure**:

   - `/api/v1/health` - Health check endpoint
   - `/api/v1/auth/*` - Authentication routes (register, login, logout, me, update-user)
   - `/api/v1/messages/*` - Message routes (all protected)

3. **Models** (`backend/src/models/`):

   - `user.model.ts` - User schema with email/username/password
   - `message.model.ts` - Message schema with senderId/receiverId/text/image

4. **Security Layer** (`backend/src/lib/arcjet.ts`):

   - Arcjet provides rate limiting (3 requests per 10 seconds), bot detection, and SQL injection shield
   - Configured at module level, enforced via middleware
   - Postman and search engines are allowlisted

5. **Utilities** (`backend/src/lib/`):
   - `dbconn.ts` - MongoDB connection with environment-aware config
   - `generateToken.ts` - JWT token generation
   - `verifyToken.ts` - JWT token verification
   - `hashPassword.ts` - bcrypt password hashing
   - `email/` - Email sending via Resend

### Authentication Flow

- JWT tokens stored in HTTP-only cookies (`auth_token`)
- `authMiddleware` verifies token and enriches `req.user` with `{ id, email }`
- Express Request interface extended via `backend/src/types/express.d.ts`
- Protected routes require `authMiddleware` after `arcjetMiddleware`

### Database Patterns

- Mongoose models with strict schemas and validation
- `autoIndex: false` in production for performance
- Pre-save hooks prevent security violations (e.g., unhashed passwords)
- Indexed fields: `email`, `username`, `senderId`, `receiverId`

### Import Conventions

Both frontend and backend use ES modules:

- All imports must use `.js` extensions even in TypeScript files
- Example: `import { foo } from "./lib/bar.js"` (not `.ts`)

### TypeScript Configuration

Backend uses strict TypeScript (`strict: true`) with:

- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `verbatimModuleSyntax: true`
- `isolatedModules: true`

Frontend uses project references (see `tsconfig.app.json` and `tsconfig.node.json`).

## Git Workflow

Main branch: `main`

Current feature branch: `feature/messages-api` (messages API implementation in progress)

## Common Patterns

### Error Handling

Controllers and middleware use consistent error handling:

- Log errors with structured context (userId, path, message, stack)
- Return user-safe error messages in JSON responses
- "Fail closed" approach for security middleware (block on error)

### Logging Convention

Prefix all logs with category: `[STARTUP]`, `[DB]`, `[AUTH]`, `[SECURITY]`, etc.

### Password Security

- Passwords hashed with bcrypt before storage
- Pre-save hook validates password length (must be 60+ chars, i.e., hashed)
- Password field has `select: false` (excluded from queries by default)

### Message Validation

Messages must contain either `text` or `image` field (enforced via pre-validate hook).
