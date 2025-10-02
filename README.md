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

- Database Layer: ✅ Prisma configured with comprehensive schema (Person, Company, Project, Relationship, OutreachSequence, SequenceStep, Message) and Prisma Client singleton
- State Management: ✅ Zustand store for selected person/company and UI state
- Automation Infrastructure: ✅ Inngest client and sendOutreachMessage function; webhook at /api/inngest
- Messaging Integration: ✅ Twilio (WhatsApp/SMS) and Resend (Email) integrated with lazy initialization; multi-channel support
- Scheduled Automation: ✅ Vercel Cron at /api/cron/outreach (9 AM daily) with vercel.json; processes due sequences and triggers Inngest
- Templates: ✅ Message Templates CRUD UI and API; variable insertion system
- Dashboard: ✅ Recent Activity and Stats powered by /api/dashboard/activity and /api/dashboard/stats
- Audit Trail: ✅ Messages recorded in Message table on send
- Sequences UI: ⏳ Not implemented (builder/management screens outstanding)
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

The system includes these core models:

- **Person**: Contacts with email, phone, and WhatsApp
- **Company**: Organizations
- **Project**: Opportunities/positions
- **Relationship**: Links people to companies/projects as CLIENT, CANDIDATE, or BOTH
- **OutreachSequence**: Automated communication campaigns
- **SequenceStep**: Individual steps in a sequence
- **Message**: Complete audit trail of all sent messages

## 🔄 Automation Flow

1. Create an `OutreachSequence` for a person
2. Define `SequenceStep`s with channels (EMAIL, WHATSAPP, SMS) and delays
3. Daily cron job checks for due sequences
4. Inngest processes message sending reliably
5. Messages are tracked in the `Message` table
6. Sequences automatically progress or complete

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
- Templates
  - `GET /api/templates` - List message templates
  - `POST /api/templates` - Create template
  - `GET /api/templates/[id]` - Get template by ID
  - `PUT /api/templates/[id]` - Update template
  - `DELETE /api/templates/[id]` - Delete template
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

- [ ] Authentication (NextAuth.js or similar)
- [ ] Outreach Sequences UI (builder, scheduling, status)
- [ ] Attach Templates to SequenceSteps (subject/body mapping per channel)
- [ ] Provider Webhooks for Delivery Status (Twilio, Resend) and update Message.status
- [ ] Real Message Activity Charts (replace mock data) and deeper analytics/reporting
- [ ] Roles & Permissions (multi-user)
- [ ] Testing: unit/integration (Prisma tests, API tests, UI)
- [ ] Rate Limits & Quotas documentation (Twilio/Resend)
- [ ] Data seeding scripts

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Resend Documentation](https://resend.com/docs)

## 📄 License

MIT License - see LICENSE file for details