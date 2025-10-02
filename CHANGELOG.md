# Changelog

All notable changes to this project will be documented in this file.

## [2025-10-02]

### Added
- Messaging Templates feature: CRUD UI (TemplatesList, TemplateForm, TemplateCard) and API routes (/api/templates, /api/templates/[id])
- Dashboard Recent Activity and Stats with new endpoints:
  - GET /api/dashboard/activity (people, companies, projects, relationships, messages)
  - GET /api/dashboard/stats (people, companies, active projects, messages with period deltas)
- Outreach cron processor at GET /api/cron/outreach with CRON_SECRET protection and vercel.json schedule (9 AM daily)

### Changed
- Implemented lazy initialization for Twilio and Resend in Inngest functions to prevent build-time failures without credentials
- Refactored Person/Company/Project forms to prepopulate fields when editing
- Made list rows link to detail pages with better UX and preserved menu interactions
- Replaced locale-dependent date rendering with deterministic formatter (utils/date.ts) to fix hydration mismatches

### Fixed
- Hydration error caused by toLocaleDateString differences between server and client
- Duplicate imports and minor lint issues in card components

### Notes
- Delivery status webhooks (Twilio/Resend) are not yet implemented
- Outreach Sequences UI (builder/management) not yet implemented
- Authentication and testing suites are not yet implemented
