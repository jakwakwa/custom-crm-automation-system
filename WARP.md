# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
A custom CRM/ATS (Customer Relationship Management / Applicant Tracking System) with automated outreach sequences via WhatsApp, SMS, and email. The system manages relationships between People, Companies, and Projects while automating timed communication sequences.

### Automated Outreach Sequences
The core feature allows creating multi-step, multi-channel outreach sequences:
- **Example**: Day 1 (WhatsApp) → Day 2 (Email) → Day 3 (WhatsApp) → Day 7 (Email)
- **Channels Supported**: Email, WhatsApp, SMS
- **Future Enhancement**: LinkedIn messaging (requires LinkedIn API or third-party integration)
- **How It Works**:
  1. Create a **SequenceTemplate** with multiple steps and timing delays
  2. Apply the template to a **Person** to create an active **OutreachSequence**
  3. Daily cron job checks which steps need execution
  4. Inngest workflows send messages via Twilio (WhatsApp/SMS) or Resend (Email)

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
- **SequenceTemplate**: Reusable outreach sequence definitions (e.g., "4-Day Candidate Outreach")
- **SequenceTemplateStep**: Individual steps in a template with channel, delay, and message content
- **OutreachSequence**: Active sequence instances applied to specific people
- **SequenceStep**: Execution tracking for individual steps in active sequences
- **MessageTemplate**: Reusable message templates with variable substitution ({{firstName}}, etc.)
- **Message**: Audit trail of all sent messages

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
- Twilio for WhatsApp & SMS: Use message templates; handle delivery status (webhooks TBD)
- Resend for Email: Use email templates; track open/click rates (webhooks TBD)
- Lazy initialize providers to avoid build failures without credentials
- Store message history in database for audit trail

## Environment Variables Required
```
DATABASE_URL              # Supabase PostgreSQL connection string
TWILIO_ACCOUNT_SID        # Twilio account identifier
TWILIO_AUTH_TOKEN         # Twilio authentication token
TWILIO_WHATSAPP_NUMBER    # Twilio WhatsApp-enabled phone number
TWILIO_PHONE_NUMBER       # Twilio SMS-enabled phone number
RESEND_API_KEY            # Resend email service API key
RESEND_FROM_EMAIL         # Default from email address (e.g. no-reply@domain)
INNGEST_EVENT_KEY         # Inngest event authentication key
INNGEST_SIGNING_KEY       # Inngest webhook signing key
CRON_SECRET               # Secret token for securing cron endpoints
NEXT_PUBLIC_APP_URL       # Public URL of the application
```

## Project Structure (current)
```
/app                     # Next.js App Router pages and layouts
  /api                   # API route handlers
    /inngest             # Inngest webhook endpoint
    /cron                # Cron job endpoints
    /dashboard           # Dashboard endpoints (activity, stats)
    /persons             # Person CRUD
    /companies           # Company CRUD
    /projects            # Project CRUD
    /relationships       # Relationship CRUD
    /templates           # Message Template CRUD
/components             # React components
  /dashboard            # Dashboard UI
  /people               # People UI
  /companies            # Companies UI
  /projects             # Projects UI
  /relationships        # Relationships UI
  /templates            # Templates UI
/lib                    # Shared libs
  prisma.ts             # Prisma Client singleton
  inngest.ts            # Inngest client configuration
/prisma                 # Database schema and migrations
/stores                 # Zustand state stores
/utils                  # Utilities (date formatting)
/inngest                # Inngest functions (sendOutreachMessage)
```

## Notes for Future Development
- Update this file when adding new npm scripts
- Document any custom Inngest functions or cron schedules added
- Keep Prisma schema comments up to date
- Document any rate limits or API quotas (Twilio, Resend)
- Add integration testing patterns once established

### Current Status & Outstanding Work
- Templates: Implemented CRUD and variable insertion (UI + API)
- Dashboard: Recent Activity and Stats backed by API
- Cron & Inngest: Daily sequence processing triggers message sends
- Sequences UI: NOT IMPLEMENTED (builder, management, attach templates to steps)
- Delivery Webhooks: NOT IMPLEMENTED (Twilio status callbacks, Resend webhooks)
- Auth: NOT IMPLEMENTED
- Testing: NOT IMPLEMENTED


## Development Guidelines

> **Source of Truth**: Complete rules live in [`.cursor/rules/critical-project-rules.mdc`](.cursor/rules/critical-project-rules.mdc).
> This section provides a quick reference for key development patterns.

### Next.js App Router Patterns

#### Page Structure
- **Protected pages**: Place under `app/(protected)/...` for automatic sidebar/header layout
- **Thin pages**: Keep `page.tsx` minimal, do data fetching in Server Components
- **Co-location**: Put `loading.tsx`, `error.tsx`, `route.ts` alongside `page.tsx`
- **API routes**: Place handlers in `app/api/.../route.ts`

#### Component Architecture
- **Server Components first**: Default to Server Components for data fetching
- **Client Components**: Use `"use client"` only for interactivity
- **Data flow**: Pass data to Client Components via props only

### TypeScript Best Practices

#### Type Safety
- **Explicit typing**: All functions must have explicit return types
- **Runtime validation**: Use Zod schemas to validate API responses
- **Prisma types**: Import from `@/lib/types.ts`, use exact schema field names
- **Type imports**: Always use `import type` for type-only imports

#### Schema Validation Example
```typescript
const MyDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

type MyData = z.infer<typeof MyDataSchema>;
```

### Database & Prisma Patterns

> **Schema Source**: [`.cursor/rules/schema-source-of-truth.mdc`](.cursor/rules/schema-source-of-truth.mdc)

#### Schema Rules (Critical)
- **Source of truth**: `prisma/schema.prisma` defines ALL field names - never invent new ones
- **Field naming**: Use exact snake_case field names from schema 
- **Relations**: Use camelCase relation names as defined
- **Types**: Import Prisma-generated types, don't create custom interfaces in pages
- **When unsure**: Always check `prisma/schema.prisma` directly

#### Correct Query Examples


#### Emergency Fix Protocol
1. **Revert immediately** any change with casing mismatches
2. **Verify names** directly in `prisma/schema.prisma`
3. **Cross-check** working API routes under `app/api/**`
4. **Never regenerate** Prisma Client without verifying field names

#### Data Fetching
- **Caching**: Prefer `fetch(url, { next: { revalidate: <seconds> } })`
- **Dynamic content**: Use `import { unstable_noStore as noStore } from "next/cache"`
- **Parallel fetching**: Use `Promise.all` for independent data

### Code Scaffolds

#### Server Page Template
```typescript
// app/(protected)/example/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";
import type { MyData } from "@/lib/types";

export const revalidate = 3600; // ISR preferred

const MyDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

async function fetchData(): Promise<MyData[]> {
  const res = await fetch("/api/example", { next: { revalidate } });
  if (!res.ok) throw new Error("Failed to load");
  const data = await res.json();
  return z.array(MyDataSchema).parse(data) as MyData[];
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Example", description: "Example page" };
}

export default async function Page() {
  const dataPromise = fetchData();
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <pre>{JSON.stringify(await dataPromise, null, 2)}</pre>
    </Suspense>
  );
}
```

#### Client Component Template
```typescript
// app/(protected)/example/_components/client-component.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { MyData } from "@/lib/types";

type ClientProps = {
  data: MyData[];
  label: string;
};

export function ClientComponent({ data, label }: ClientProps) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>{label}: {count}</p>
      <Button onClick={() => setCount((n) => n + 1)}>Increment</Button>
    </div>
  );
}
```

### Pre-commit Checklist


- [ ] Server Components by default; Client Components only for interactivity  
- [ ] No hardcoded interfaces in page files; types imported from `lib/types.ts`
- [ ] Uses `<Image />` and existing shadcn/ui components
- [ ] Co-located `loading.tsx` and `error.tsx` where applicable
- [ ] Uses `fetch` with `revalidate` or `noStore` for dynamic content
- [ ] Parallelizes data fetching with `Promise.all` when useful
- [ ] `pnpm build` and `pnpm lint` pass with no errors before commit



## Development Commands

### Server & Development
```warp-runnable-command
pnpm dev
```
### Build Commands
```warp-runnable-command
pnpm build
```
Production build with Prisma generation

## Database Commands

### Prisma Operations



### Data Seeding


## Code Quality & Testing

### Linting & Formatting




## Background Jobs & Services

### Inngest
```warp-runnable-command
pnpm inngest
```
Start Inngest development server for background jobs

## Environment Setup

### Prerequisites Check
```warp-runnable-command
node --version
```
Check Node.js version (should be v22)

```warp-runnable-command
pnpm --version
```
Check pnpm version

### Database Status
```warp-runnable-command
npx prisma studio
```
Open Prisma Studio for database management

```warp-runnable-command
npx prisma db push
```
Push schema changes without migrations

## Project Structure

### Key Directories
- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/prisma` - Database schema and migrations
- `/scripts` - Utility scripts for seeding and maintenance
- `/public` - Static assets

### Important Files
- `package.json` - Project dependencies and scripts
- `prisma/schema.prisma` - Database schema
- `next.config.mjs` - Next.js configuration
- `.env.local` - Environment variables (not in repo)




## Tech Stack Quick Reference

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: not implemented yet
- **Background Jobs**: Inngest
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: pnpm