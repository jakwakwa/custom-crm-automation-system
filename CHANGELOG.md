# Changelog

All notable changes to this project will be documented in this file.

## [2025-10-02] - Sequence Automation Backend Complete

### Added - Sequence Automation System
- **Two-tier sequence architecture**:
  - `SequenceTemplate` model: Reusable sequence blueprints (e.g., "4-Day Candidate Outreach")
  - `SequenceTemplateStep` model: Steps with channel, delay, subject, and message content
  - `OutreachSequence` model: Active sequence instances tied to specific people (updated)
  - `SequenceStep` model: Execution tracking for active sequences (updated)
- **Complete REST API for Sequence Templates**:
  - `GET|POST /api/sequences` - List and create sequence templates
  - `GET|PUT|DELETE /api/sequences/[id]` - CRUD for individual templates
  - `GET|POST /api/sequences/[id]/steps` - Manage steps within templates
  - `GET|PUT|DELETE /api/sequences/[id]/steps/[stepId]` - Individual step operations
- **Database migrations**:
  - `20251002180114_add_subject_and_template_to_sequence_step` - Added subject and template reference
  - `20251002180634_add_sequence_templates` - Complete two-tier architecture refactor
- **LinkedIn future enhancement**: Commented in MessageChannel enum with TODO note
- **Documentation**:
  - `SEQUENCE_AUTOMATION_PROGRESS.md` - Comprehensive technical breakdown of sequence system
  - Updated `WARP.md` with sequence automation details and LinkedIn future plans
  - Updated `README.md` with two-tier architecture explanation and new API routes

### Added - Earlier Features
- Messaging Templates feature: CRUD UI (TemplatesList, TemplateForm, TemplateCard) and API routes (/api/templates, /api/templates/[id])
- Dashboard Recent Activity and Stats with new endpoints:
  - GET /api/dashboard/activity (people, companies, projects, relationships, messages)
  - GET /api/dashboard/stats (people, companies, active projects, messages with period deltas)
- Outreach cron processor at GET /api/cron/outreach with CRON_SECRET protection and vercel.json schedule (9 AM daily)

### Changed
- **Schema refactor**: Separated sequence templates from active instances for better reusability
- **Field naming**: Renamed `templateId` to `messageTemplateId` in steps for clarity
- **Field naming**: Renamed `order` to `stepNumber` for consistency
- Implemented lazy initialization for Twilio and Resend in Inngest functions to prevent build-time failures without credentials
- Refactored Person/Company/Project forms to prepopulate fields when editing
- Made list rows link to detail pages with better UX and preserved menu interactions
- Replaced locale-dependent date rendering with deterministic formatter (utils/date.ts) to fix hydration mismatches

### Fixed
- Hydration error caused by toLocaleDateString differences between server and client
- Duplicate imports and minor lint issues in card components
- TypeScript type errors in sequence API routes
- Build compilation errors related to Prisma schema changes

### Outstanding Work
- **Sequences UI** (High Priority):
  - Frontend builder for creating/editing sequence templates
  - Step management with drag-and-drop reordering
  - Channel/delay/message configuration interface
  - Template variable preview with person context
- **Apply Sequences to People** (High Priority):
  - UI on person detail pages to start sequences
  - Sequence template selector and instance creation
  - Display active sequences and progress tracking
- **Cron Execution Logic** (High Priority):
  - Update cron job to query due OutreachSequences
  - Trigger Inngest for message sending
  - Update step execution status and calculate next step time
- **Provider Webhooks** (Medium Priority):
  - Twilio/Resend delivery status updates
  - Update Message.status (DELIVERED/FAILED/BOUNCED)
- **Real Analytics** (Medium Priority):
  - Replace mock dashboard data with real aggregations
- **LinkedIn Integration** (Medium Priority):
  - LinkedIn API or third-party service integration
  - Uncomment LinkedIn in MessageChannel enum
- **Authentication & Testing** (Lower Priority)
  - NextAuth.js or similar
  - Unit/integration test suites
  - Data seeding scripts
