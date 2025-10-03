# Custom CRM/ATS Automation System

A powerful CRM and Applicant Tracking System with automated multi-channel outreach sequences via WhatsApp, SMS, and Email.

## 🚀 Features

- **Contact Management**: Manage people, companies, and projects
- **Relationship Tracking**: Track whether contacts are clients, candidates, or both
- **Automated Outreach Sequences**: Create multi-step communication workflows
- **Multi-Channel Messaging**: Send messages via Email (Resend), WhatsApp (Twilio), and SMS (Twilio)
- **Scheduled Automation**: Daily cron jobs process due outreach steps
- **Reliable Delivery**: Inngest ensures message delivery with retries
- **Audit Trail**: Complete message history tracking

## 📌 Project Status

- Database Layer: ✅ Prisma configured with comprehensive schema including SequenceTemplate/OutreachSequence two-tier architecture
- State Management: ✅ Zustand store for selected person/company and UI state
- Automation Infrastructure: ✅ Inngest client and sendOutreachMessage function; webhook at /api/inngest
- Messaging Integration: ✅ Twilio (WhatsApp/SMS) and Resend (Email) integrated with lazy initialization; multi-channel support
- Scheduled Automation: ✅ Vercel Cron at /api/cron/outreach (9 AM daily) with vercel.json; processes due sequences and triggers Inngest
- Message Templates: ✅ CRUD UI and API with variable substitution ({{firstName}}, {{lastName}}, etc.)
- Sequence Templates: ✅ Complete backend API for sequence templates and steps (CRUD operations)
- Dashboard: ✅ Recent Activity and Stats powered by /api/dashboard/activity and /api/dashboard/stats
- Audit Trail: ✅ Messages recorded in Message table on send
- Sequences UI: ⏳ Frontend builder/management screens not yet implemented
- Active Sequence Management: ⏳ Applying templates to people, execution tracking UI
- Delivery Webhooks: ⏳ Not implemented (Twilio/Resend delivery status updates)
- Authentication: ⏳ Not implemented
- Testing: ⏳ Not implemented

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase PostgreSQL with Prisma ORM
- **Automation**: Inngest for workflow orchestration
- **Messaging**: 
  - Twilio (WhatsApp & SMS)
  - Resend (Email)
- **Deployment**: Vercel with Cron Jobs

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- Twilio account with WhatsApp Business API
- Resend account for email
- Inngest account (free tier available)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jakwakwa/custom-crm-automation-system.git
   cd custom-crm-automation-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your credentials in `.env.local`:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - Twilio credentials for WhatsApp/SMS
   - Resend API key for email
   - Inngest event and signing keys
   - CRON_SECRET for securing cron endpoints

4. **Generate Prisma Client and run migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Start Inngest Dev Server (in a separate terminal)**
   ```bash
   npx inngest-cli dev
   ```

## 📊 Database Schema

The system uses a two-tier sequence architecture:

### Core Entities
- **Person**: Contacts with email, phone, and WhatsApp
- **Company**: Organizations
- **Project**: Opportunities/positions
- **Relationship**: Links people to companies/projects as CLIENT, CANDIDATE, or BOTH

### Sequence Templates (Reusable Blueprints)
- **SequenceTemplate**: Reusable sequence definitions (e.g., "4-Day Candidate Outreach")
- **SequenceTemplateStep**: Individual steps with channel, delay, subject, and message content
- **MessageTemplate**: Reusable message content with variable substitution

### Active Sequences (Applied to People)
- **OutreachSequence**: Active sequence instances tied to specific people
- **SequenceStep**: Execution tracking for individual steps in active sequences
- **Message**: Complete audit trail of all sent messages

## 🔄 Automation Flow

### Sequence Creation
1. Create a `SequenceTemplate` with multiple steps (e.g., "4-Day Candidate Outreach")
2. Define `SequenceTemplateStep`s with:
   - Channel (EMAIL, WHATSAPP, SMS) - *LinkedIn planned for future*
   - Delay in days (0 = immediate, 1 = next day, etc.)
   - Message content (inline or reference a `MessageTemplate`)
   - Subject line (for EMAIL channel)

### Applying to People
1. Apply a `SequenceTemplate` to a `Person` → creates an `OutreachSequence` instance
2. System copies template steps to active `SequenceStep`s
3. Calculates execution times based on start date + cumulative delays

### Automated Execution
1. Daily cron job (9 AM) checks for due sequences where `nextStepAt <= NOW()`
2. Inngest processes message sending reliably with retries
3. Messages are tracked in the `Message` table for audit trail
4. Step marked as executed, next step time calculated
5. Sequences automatically progress to next step or mark as completed

## 🌐 API Routes

- Persons
  - `GET /api/persons` - List people
  - `POST /api/persons` - Create person
  - `GET /api/persons/[id]` - Get person by ID
  - `PUT /api/persons/[id]` - Update person
  - `DELETE /api/persons/[id]` - Delete person
- Companies
  - `GET /api/companies` - List companies
  - `POST /api/companies` - Create company
  - `GET /api/companies/[id]` - Get company by ID
  - `PUT /api/companies/[id]` - Update company
  - `DELETE /api/companies/[id]` - Delete company
- Projects
  - `GET /api/projects` - List projects
  - `POST /api/projects` - Create project
  - `GET /api/projects/[id]` - Get project by ID
  - `PUT /api/projects/[id]` - Update project
  - `DELETE /api/projects/[id]` - Delete project
- Relationships
  - `GET /api/relationships` - List relationships
  - `POST /api/relationships` - Create relationship
  - `GET /api/relationships/[id]` - Get relationship by ID
  - `PUT /api/relationships/[id]` - Update relationship
  - `DELETE /api/relationships/[id]` - Delete relationship
- Message Templates
  - `GET /api/templates` - List message templates
  - `POST /api/templates` - Create template
  - `GET /api/templates/[id]` - Get template by ID
  - `PUT /api/templates/[id]` - Update template
  - `DELETE /api/templates/[id]` - Delete template
- Sequence Templates
  - `GET /api/sequences` - List all sequence templates with steps
  - `POST /api/sequences` - Create sequence template with steps
  - `GET /api/sequences/[id]` - Get sequence template with steps
  - `PUT /api/sequences/[id]` - Update sequence metadata
  - `DELETE /api/sequences/[id]` - Delete sequence template
  - `GET /api/sequences/[id]/steps` - List steps for a sequence
  - `POST /api/sequences/[id]/steps` - Add step to sequence
  - `GET /api/sequences/[id]/steps/[stepId]` - Get single step
  - `PUT /api/sequences/[id]/steps/[stepId]` - Update step
  - `DELETE /api/sequences/[id]/steps/[stepId]` - Delete step
- Automation & Dashboard
  - `GET /api/cron/outreach` - Process due outreach sequences (secured with CRON_SECRET)
  - `GET /api/dashboard/activity` - Recent activity feed
  - `GET /api/dashboard/stats` - Dashboard statistics
  - `GET|POST|PUT /api/inngest` - Inngest webhook endpoint

## 🧪 Development Tools

- **Prisma Studio**: Visual database editor
  ```bash
  npx prisma studio
  ```

- **Inngest Dev Server**: Test automation workflows locally
  ```bash
  npx inngest-cli dev
  ```

## 🚀 Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The `vercel.json` configuration automatically sets up the daily cron job.

### Inngest Setup

1. Create an Inngest account
2. Deploy your app to Vercel
3. Configure Inngest webhook URL: `https://your-app.vercel.app/api/inngest`

## 📝 Next Steps

### High Priority
- [ ] **Sequences UI**: Frontend components for creating/editing sequence templates
  - Sequence builder with step management
  - Drag-and-drop step reordering
  - Channel/delay/message configuration per step
  - Template variable preview with person context
- [ ] **Apply Sequences to People**: UI for starting sequences on person detail pages
  - Sequence template selector
  - Creates OutreachSequence instance
  - Display active sequences and their progress
- [ ] **Cron Execution Logic**: Update cron job to execute sequence steps
  - Query due OutreachSequences
  - Trigger Inngest for message sending
  - Update step execution status and calculate next step time

### Medium Priority
- [ ] **Provider Webhooks**: Twilio/Resend delivery status updates
  - Update Message.status (DELIVERED/FAILED/BOUNCED)
  - Enrich audit trail with delivery timestamps
- [ ] **Real Analytics**: Replace mock dashboard data
  - Message aggregations by channel/day
  - Delivery/failure rates, email opens/clicks
- [ ] **LinkedIn Integration**: Add LinkedIn messaging channel
  - LinkedIn API or third-party service integration
  - Update MessageChannel enum

### Lower Priority
- [ ] Authentication (NextAuth.js or similar)
- [ ] Roles & Permissions (multi-user)
- [ ] Testing: unit/integration (Prisma tests, API tests, UI)
- [ ] Rate Limits & Quotas documentation (Twilio/Resend)
- [ ] Data seeding scripts
- [ ] Inngest workflow tests

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Resend Documentation](https://resend.com/docs)

## 📄 License

MIT License - see LICENSE file for details