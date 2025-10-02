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

- `POST /api/persons` - Create a new person
- `GET /api/persons` - List all persons
- `GET /api/cron/outreach` - Process due outreach sequences (secured with CRON_SECRET)
- `POST /api/inngest` - Inngest webhook endpoint

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

- [ ] Add authentication (NextAuth.js recommended)
- [ ] Build UI for managing persons, companies, and projects
- [ ] Create sequence builder interface
- [ ] Add analytics and reporting
- [ ] Implement message templates system
- [ ] Add webhook handlers for delivery status updates
- [ ] Create company and project API routes

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Resend Documentation](https://resend.com/docs)

## 📄 License

MIT License - see LICENSE file for details