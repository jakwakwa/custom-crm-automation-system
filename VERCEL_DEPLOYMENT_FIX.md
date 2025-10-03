# Vercel Deployment Fix Guide

## Issue
Vercel deployment is failing with error:
```
Type error: Property 'subject' does not exist on type SequenceStep
```

## Root Cause
The production database on Vercel **hasn't had the latest migrations applied yet**. The Prisma client is trying to access fields that don't exist in the current production schema.

## Solution Steps

### 1. Add Environment Variables to Vercel ✅ (You're doing this now)

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables for **Production**, **Preview**, and **Development**:

```
DATABASE_URL=your_supabase_connection_string
CRON_SECRET=your_cron_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=your_from_email
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 2. Run Migrations on Production Database

**Option A: Via Vercel CLI (Recommended)**
```bash
# Make sure you have DATABASE_URL set locally to production
vercel env pull .env.production

# Run migrations against production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma migrate deploy
```

**Option B: Via Prisma Studio**
```bash
# Connect to production database
npx prisma studio

# Migrations will auto-apply when Prisma connects
```

**Option C: Add to Build Command (Not Recommended - can be slow)**
Update `package.json`:
```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### 3. Seed the Production Database (Optional but Recommended)

After migrations are applied:
```bash
# Make sure DATABASE_URL points to production
DATABASE_URL=your_production_url npx prisma db seed
```

This will populate your production database with:
- 10 sample people
- 8 sample companies
- 13 sample projects
- 13 relationships
- 3 message templates
- 2 sequence templates
- 5 sequence template steps

### 4. Trigger New Deployment

Once environment variables are added:
```bash
# Push to trigger new deploy (or use Vercel dashboard to redeploy)
git push origin develop
```

Or in Vercel Dashboard:
- Go to Deployments
- Click "..." on latest deployment
- Click "Redeploy"

## Verification

Once deployed, check:

1. **Build Logs**: Should show "Compiled successfully"
2. **Database Connection**: Visit `/api/dashboard/stats` - should return data
3. **Templates Page**: Visit `/templates` - should show seeded templates
4. **Dashboard**: Should show activities

## Future Prevention

To avoid this in future deployments:

### Option 1: Automatic Migrations (Add to package.json)
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma migrate deploy && next build"
  }
}
```

**Pros**: Automatic  
**Cons**: Builds take longer, migrations run on every build

### Option 2: Manual Process (Current)
1. Always run migrations locally first
2. Test build locally: `npm run build`
3. Run migrations on production manually
4. Then deploy

**Pros**: More control, faster builds  
**Cons**: Manual step required

## Troubleshooting

### Build still fails after adding env vars?
- Make sure DATABASE_URL is in all environments (Production, Preview, Development)
- Check the database URL format: `postgresql://user:pass@host:port/db`
- Verify Supabase connection pooler is not being used for migrations

### Migrations won't apply?
```bash
# Check migration status
npx prisma migrate status

# If stuck, reset (CAUTION: Dev only!)
npx prisma migrate reset

# For production, manually run SQL from migration files
```

### Still getting type errors?
```bash
# Regenerate Prisma client
npx prisma generate

# Check generated types
cat node_modules/.prisma/client/index.d.ts | grep "subject"
```

## Current Migration Status

✅ **Local Development**:
- All migrations applied
- Database seeded
- Build working

⏳ **Production (Vercel)**:
- Waiting for environment variables
- Migrations pending
- Build failing

📋 **Migrations to Apply**:
1. `20251002150451_init` - Initial schema
2. `20251002180114_add_subject_and_template_to_sequence_step` - Added subject field
3. `20251002180634_add_sequence_templates` - Two-tier architecture

---

**Last Updated**: October 2, 2025  
**Status**: Waiting for DATABASE_URL in Vercel
