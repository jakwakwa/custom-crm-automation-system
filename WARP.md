# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
A custom CRM/ATS (Customer Relationship Management / Applicant Tracking System) with automated outreach sequences via WhatsApp and email. The system manages relationships between People, Companies, and Projects while automating timed communication sequences.

## Tech Stack
- **Frontend**: Next.js (App Router), React, TypeScript
- **State Management**: Zustand
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **Automation**: Inngest (for workflow automation)
- **Messaging**: Twilio API (WhatsApp), Resend (Email)
- **Job Scheduling**: Vercel Cron Jobs
- **Deployment**: Vercel

## Database Schema
Core entities managed via Prisma:
- **Person**: Contacts/individuals in the system
- **Company**: Organizations
- **Project**: Opportunities/positions being tracked
- **Relationship**: Junction table tracking whether a Person is a client, candidate, or both

All database interactions use Prisma ORM for type-safe queries against Supabase PostgreSQL.

## Architecture

### Data Layer
- Prisma ORM for all database operations with Supabase PostgreSQL
- Type-safe database queries using Prisma Client
- Migrations managed through Prisma CLI

### Application Layer
- Next.js API Routes handle data fetching and complex business logic
- Server-side data operations secured through API routes
- Zustand for efficient global state management in React components

### Automation Layer
- **Inngest**: Orchestrates workflow automation and event-driven processes
- **Vercel Cron Jobs**: Daily database checks for records needing next sequence step
- **Twilio API**: WhatsApp messaging integration for outreach
- **Resend**: Email service for timed outreach sequences

### Communication Flow
1. Cron job triggers daily check of database
2. Identifies records needing next communication step
3. Inngest workflows execute timed outreach sequences
4. Messages sent via Twilio (WhatsApp) or Resend (Email)

## Common Commands

### Project Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials:
# - DATABASE_URL (Supabase connection string)
# - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
# - RESEND_API_KEY
# - INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY
```

### Development Server
```bash
# Run Next.js dev server
npm run dev

# Run Inngest dev server (in separate terminal)
npx inngest-cli dev
```

### Database Operations with Prisma
```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name description_of_change

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (GUI for database management)
npx prisma studio

# Reset database (dev only - WARNING: deletes all data)
npx prisma migrate reset

# Push schema changes without migration (dev only)
npx prisma db push

# Seed database
npx prisma db seed
```

### Testing
```bash
# Run all tests (to be configured)
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test path/to/test-file
```

### Building and Deployment
```bash
# Build for production
npm run build

# Run production build locally
npm start

# Deploy to Vercel (via CLI)
vercel

# Deploy to production
vercel --prod
```

### Linting and Formatting
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint -- --fix

# Format code (if Prettier is configured)
npm run format
```

## Key Development Patterns

### Database Access
- All database queries go through Prisma Client
- Use Prisma transactions for multi-step operations
- Leverage Prisma's type safety - avoid raw SQL unless absolutely necessary

### API Routes
- Keep business logic in API routes (server-side)
- Validate input data before database operations
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Return consistent error responses

### Automation Workflows
- Define Inngest functions for multi-step automation sequences
- Use Inngest for reliable, retryable background jobs
- Keep cron job logic minimal - delegate to Inngest workflows
- Test automation flows locally with Inngest dev server

### State Management
- Use Zustand stores for global client-side state
- Keep stores focused and modular
- Avoid duplicating server state - use React Query or SWR if needed

### Scheduled Tasks
- Vercel Cron Jobs defined in `vercel.json` or API route comments
- Cron jobs should query database for pending actions
- Delegate actual work to Inngest workflows for reliability

### Messaging Integration
- Twilio for WhatsApp: Use message templates, handle delivery status
- Resend for Email: Use email templates, track open/click rates
- Store message history in database for audit trail

## Environment Variables Required
```
DATABASE_URL              # Supabase PostgreSQL connection string
TWILIO_ACCOUNT_SID        # Twilio account identifier
TWILIO_AUTH_TOKEN         # Twilio authentication token
TWILIO_WHATSAPP_NUMBER    # Twilio WhatsApp-enabled phone number
RESEND_API_KEY            # Resend email service API key
INNGEST_EVENT_KEY         # Inngest event authentication key
INNGEST_SIGNING_KEY       # Inngest webhook signing key
NEXT_PUBLIC_APP_URL       # Public URL of the application
```

## Project Structure (when initialized)
```
/prisma
  schema.prisma           # Database schema definition
  /migrations             # Migration history
/src
  /app                    # Next.js App Router pages and layouts
    /api                  # API route handlers
      /inngest            # Inngest webhook endpoint
      /cron               # Cron job endpoints
  /components             # React components
  /lib
    /prisma.ts            # Prisma Client singleton
    /inngest.ts           # Inngest client configuration
  /stores                 # Zustand state stores
  /types                  # TypeScript type definitions
  /utils                  # Utility functions
```

## Notes for Future Development
- Update this file when adding new npm scripts
- Document any custom Inngest functions or cron schedules added
- Keep Prisma schema comments up to date
- Document any rate limits or API quotas (Twilio, Resend)
- Add integration testing patterns once established
