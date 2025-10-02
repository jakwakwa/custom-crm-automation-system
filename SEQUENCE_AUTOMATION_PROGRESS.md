# Sequence Automation - Development Progress

## Overview
Implementing automated multi-channel outreach sequences for recruitment CRM. Based on client requirement: automated messages sent across different channels with configurable day delays.

**Client's Vision**: 
> "I want automated outreach where the system sends the first message on day one, second message on day two, third message on day three, fourth message on day four... across LinkedIn, email, WhatsApp"

## ✅ Completed

### 1. Database Schema (Prisma)
Created a two-tier architecture separating templates from active instances:

#### Sequence Templates (Reusable Blueprints)
- **SequenceTemplate**: The automation recipe (e.g., "4-Day Candidate Outreach")
- **SequenceTemplateStep**: Individual steps with:
  - Step number (order)
  - Delay in days
  - Channel (EMAIL, WHATSAPP, SMS)
  - Message content (inline or via MessageTemplate reference)
  - Subject (for email)

#### Active Sequences (Applied to People)
- **OutreachSequence**: Active instance tied to a specific Person
  - References the SequenceTemplate it's based on
  - Tracks current step, status (ACTIVE/PAUSED/COMPLETED)
  - Calculates next execution time
- **SequenceStep**: Copy of template steps with execution tracking
  - Executed flag
  - Execution timestamp

#### Message Templates
- **MessageTemplate**: Reusable message content with variable substitution
  - Supports {{firstName}}, {{lastName}}, etc.
  - Channel-specific (Email has subject field)
  - Categorized and activatable

#### Audit Trail
- **Message**: Complete history of all sent messages
  - Delivery status tracking
  - Provider IDs (Twilio, Resend)
  - Error logging

### 2. Database Migrations
- ✅ Initial schema migration
- ✅ Added subject and template reference to SequenceStep
- ✅ Complete refactor to SequenceTemplate architecture

### 3. Backend API Routes
Created full CRUD REST APIs for sequences:

#### `/api/sequences`
- `GET` - List all sequence templates with steps
- `POST` - Create new sequence template with steps in transaction

#### `/api/sequences/[id]`
- `GET` - Get single sequence template with all steps
- `PUT` - Update sequence metadata (name, description, isActive)
- `DELETE` - Delete sequence template (cascades to steps)

#### `/api/sequences/[id]/steps`
- `GET` - List all steps for a sequence template
- `POST` - Add new step to sequence template

#### `/api/sequences/[id]/steps/[stepId]`
- `GET` - Get single step details
- `PUT` - Update step configuration
- `DELETE` - Delete step from template

#### `/api/templates`
- `GET` - List all message templates
- `POST` - Create new message template

#### `/api/templates/[id]`
- `GET` - Get single message template
- `PUT` - Update message template
- `DELETE` - Delete message template

### 4. Frontend Components
- ✅ **TemplateForm**: Dialog component for creating/editing message templates
  - Form validation
  - Channel-specific fields (subject for email)
  - Dynamic variable insertion buttons
  - Loading states and toast notifications

## 🚧 In Progress / Next Steps

### 1. Sequences UI Components
Need to build:
- **SequencesList**: List/grid view of all sequence templates
  - Cards with step count, channel badges
  - Quick actions (edit, delete, duplicate)
  - Active/inactive toggle
  
- **SequenceBuilder**: Form for creating/editing sequences
  - Sequence metadata form (name, description)
  - Step builder with drag-and-drop reordering
  - For each step:
    - Channel selector
    - Day delay input
    - Option to use MessageTemplate or write inline
    - Preview of final message with variables
  
- **SequencesPage**: Main page at `/sequences`
  - List view with filter/search
  - "New Sequence" button
  - Integration with SequenceBuilder dialog

### 2. Applying Sequences to People
- UI component on Person detail page
- "Start Sequence" button/dialog
- Sequence template selector
- Creates OutreachSequence instance
- Shows active sequences for that person

### 3. Automation Execution (Inngest + Cron)
Update existing cron job:
- Query for OutreachSequences where `nextStepAt <= NOW()`
- For each sequence:
  - Get the current step
  - Create Inngest event to send message
  - Mark step as executed
  - Calculate and set next step time
  - Update sequence status if completed

### 4. Inngest Workflow Functions
- **sendSequenceMessage**: Handle actual message delivery
  - Route to correct channel (Email/WhatsApp/SMS)
  - Variable substitution from Person data
  - Create Message record for audit
  - Handle delivery failures with retry logic

## 📋 Future Enhancements

### LinkedIn Integration
**Client Request**: Include LinkedIn messaging in sequences

**Options**:
1. LinkedIn Recruiter API (requires enterprise license)
2. LinkedIn Sales Navigator API
3. Third-party services (Phantombuster, Dux-Soup)
4. Manual tracking (mark as "needs LinkedIn message")

**Current Status**: Commented in MessageChannel enum, marked as TODO

### Advanced Features
- A/B testing for message variants
- Response tracking and auto-pause on reply
- Time-of-day optimization
- Conditional branching based on engagement
- Analytics dashboard for sequence performance

## Technical Notes

### Why Two-Tier Architecture?
- **Templates** = Reusable blueprints (define once, use many times)
- **Instances** = Active executions tied to specific people
- Allows updating templates without affecting active sequences
- Enables analytics across all uses of a template

### Variable Substitution
Currently supported in message content:
- `{{firstName}}`
- `{{lastName}}`
- `{{email}}`
- `{{phone}}`
- `{{whatsapp}}`
- Can be extended with company/project variables

### Timing Logic
- Base date: When OutreachSequence is created (startedAt)
- Each step calculates its execution time: `startedAt + sum of all previous delays`
- Example: 
  - Start: Oct 1
  - Step 1: Day 0 → Oct 1
  - Step 2: Day 2 → Oct 3
  - Step 3: Day 1 → Oct 4 (cumulative: 0+2+1=3 days from start)

## Files Modified/Created

### Schema & Migrations
- `prisma/schema.prisma` - Complete schema with SequenceTemplate architecture
- `prisma/migrations/20251002180114_add_subject_and_template_to_sequence_step/`
- `prisma/migrations/20251002180634_add_sequence_templates/`

### API Routes
- `app/api/sequences/route.ts`
- `app/api/sequences/[id]/route.ts`
- `app/api/sequences/[id]/steps/route.ts`
- `app/api/sequences/[id]/steps/[stepId]/route.ts`
- `app/api/templates/route.ts`
- `app/api/templates/[id]/route.ts`

### Components
- `components/templates/template-form.tsx`

### Documentation
- `WARP.md` - Updated with sequence automation details
- `SEQUENCE_AUTOMATION_PROGRESS.md` (this file)

## Build Status
✅ **All TypeScript checks passing**
✅ **All API routes compile successfully**
✅ **Database schema validated**
✅ **No linting errors**

Last successful build: 2025-10-02 18:10 UTC
