# Deployment Guide

Complete guide for deploying the AI Chat MVP to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment](#vercel-deployment)
3. [Supabase Setup](#supabase-setup)
4. [Environment Configuration](#environment-configuration)
5. [Custom Domain](#custom-domain)
6. [SSL/TLS Certificate](#ssltls-certificate)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] Supabase project is created and database schema is applied
- [ ] LLM API key is valid and has sufficient credits
- [ ] Code is tested locally with `npm run dev`
- [ ] Build succeeds with `npm run build`
- [ ] All error handling is in place
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Security headers are set
- [ ] Database backups are configured
- [ ] Monitoring and logging are set up

## Vercel Deployment

Vercel is the recommended hosting platform for Next.js applications.

### Step 1: Prepare Repository

```bash
# Ensure code is committed to Git
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Create Vercel Account

Visit https://vercel.com/signup and create an account.

### Step 3: Import Project

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Authorize Vercel to access your GitHub account
4. Select the `MVP4_Streaming_AI_Chat` repository
5. Click "Import"

### Step 4: Configure Environment Variables

In the Vercel dashboard:

1. Click "Settings" → "Environment Variables"
2. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
OPENAI_API_KEY=sk-your-api-key-here
STRIPE_SECRET_KEY=sk_live_your-key-here (if using Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-key-here (if using Stripe)
NODE_ENV=production
```

3. Select which environments each variable applies to (Development, Preview, Production)
4. Click "Save"

### Step 5: Deploy

1. Click "Deploy"
2. Wait for the build and deployment to complete
3. Your app will be available at `https://your-project.vercel.app`

### Step 6: Monitor Deployment

- Check the "Deployments" tab for build logs
- Monitor "Analytics" for performance metrics
- Review "Logs" for runtime errors

## Supabase Setup

### Create Production Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - **Name:** ai-chat-mvp-prod
   - **Database Password:** Generate a strong password
   - **Region:** Choose closest to your users
4. Click "Create new project"

### Apply Database Schema

#### Option 1: Using SQL Editor

1. In Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy the entire contents of `supabase_schema.sql`
4. Paste into the editor
5. Click "Run"

#### Option 2: Using Supabase CLI

```bash
# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref your-project-ref

# Push database changes
npx supabase db push

# Verify schema
npx supabase db remote-schemas
```

### Configure Authentication

1. In Supabase dashboard, go to "Authentication" → "Providers"
2. Configure desired auth providers:
   - Email/Password (enabled by default)
   - Google OAuth
   - GitHub OAuth
   - etc.

3. Go to "Authentication" → "Settings"
4. Update "Site URL" to your production domain
5. Add allowed redirect URLs

### Set Up RLS Policies

The schema file includes all RLS policies. Verify they're created:

1. Go to "SQL Editor"
2. Run:
```sql
SELECT * FROM pg_catalog.pg_policies
WHERE schemaname = 'public';
```

You should see policies for:
- users
- conversations
- messages
- credit_transactions

### Enable Backups

1. Go to "Settings" → "Backups"
2. Enable "Automated Backups"
3. Set backup frequency (daily recommended)
4. Configure backup retention

### Configure Webhooks (Optional)

For real-time features:

1. Go to "Database" → "Webhooks"
2. Create webhook for messages table
3. Point to your API endpoint

## Environment Configuration

### Production Variables

Create a `.env.production.local` file (never commit to git):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# LLM API
OPENAI_API_KEY=sk-prod-your-key

# Stripe (if using)
STRIPE_SECRET_KEY=sk_live_your-live-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Twilio (if using)
TWILIO_ACCOUNT_SID=your-production-sid
TWILIO_AUTH_TOKEN=your-production-token
TWILIO_PHONE_NUMBER=+1-your-number

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME="AI Chat"

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
```

### Secrets Management

Use Vercel's built-in secrets management:

```bash
# List all secrets
vercel env ls

# Add a secret
vercel env add OPENAI_API_KEY

# Remove a secret
vercel env rm OPENAI_API_KEY
```

## Custom Domain

### Add Domain to Vercel

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your domain name
4. Follow DNS configuration instructions

### Update DNS Records

Point your domain to Vercel with these DNS records:

For `yourdomain.com`:
```
Name: @
Type: ALIAS
Value: cname.vercel-dns.com
```

For `www.yourdomain.com`:
```
Name: www
Type: CNAME
Value: cname.vercel-dns.com
```

### Verify Domain

1. After DNS changes propagate (5-48 hours)
2. Vercel will automatically verify the domain
3. SSL certificate will be issued automatically

### Update Supabase Auth URL

In Supabase dashboard:

1. Go to "Authentication" → "Settings"
2. Update "Site URL" to `https://yourdomain.com`
3. Add redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/auth/error`

## SSL/TLS Certificate

Vercel automatically provides free SSL certificates via Let's Encrypt.

### Verify Certificate

```bash
# Check certificate details
curl -I https://yourdomain.com

# Should show:
# HTTP/2 200
# strict-transport-security: max-age=31536000; includeSubDomains
```

### Enable HSTS

Already included in middleware.ts:
```typescript
response.headers.set(
  'Strict-Transport-Security',
  'max-age=31536000; includeSubDomains'
)
```

## Monitoring

### Vercel Analytics

1. Go to Vercel dashboard → "Analytics"
2. Monitor:
   - Web Vitals (LCP, FID, CLS)
   - Build times
   - Cold boots
   - Request duration

### Supabase Monitoring

1. Go to Supabase dashboard → "Logs"
2. Monitor:
   - Database queries
   - Authentication events
   - Function execution
   - API requests

### Error Tracking

Recommended: Set up Sentry

```bash
npm install --save-dev @sentry/nextjs
```

Configure in `next.config.js`:
```javascript
const withSentryConfig = require("@sentry/nextjs/withSentryConfig");

module.exports = withSentryConfig(
  nextConfig,
  { org: "your-org", project: "your-project" }
);
```

### Application Monitoring

Add to `app/layout.tsx`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

## Performance Optimization

### Vercel KV (Optional Caching)

For rate limiting and caching:

```bash
vercel kv list
```

### Database Query Optimization

Ensure indexes are created:
```sql
-- These are included in schema.sql, but verify:
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
```

### API Route Optimization

Add response caching:
```typescript
// In /api/chat/route.ts
response.headers.set('Cache-Control', 'no-store, max-age=0')
```

## Troubleshooting

### Build Fails

**Check build logs:**
```bash
vercel logs --source=build
```

**Common issues:**
- Missing environment variables
- TypeScript errors
- Dependency conflicts

**Solution:**
```bash
npm install
npm run build
npm run lint
```

### Runtime Errors

**Check logs:**
```bash
vercel logs --source=runtime
```

**Monitor with:**
- Browser DevTools
- Vercel Logs
- Sentry Dashboard

### Database Connection Issues

```bash
# Test connection
psql -U postgres -h db.your-project.supabase.co -d postgres
```

**Check:**
- Service role key is correct
- Database is not in read-only mode
- IP allowlist includes Vercel deployment IP

### Supabase Auth Not Working

1. Verify "Site URL" in Supabase settings
2. Check allowed redirect URLs
3. Clear browser cookies
4. Test in incognito window

### API Timeouts

**Increase timeout in route:**
```typescript
export const maxDuration = 60; // seconds
```

**For Vercel Pro plan, max is 300 seconds.**

## Security Checklist

- [ ] Enable 2FA on all accounts
- [ ] Rotate API keys regularly
- [ ] Enable database backups
- [ ] Monitor failed authentication attempts
- [ ] Review RLS policies monthly
- [ ] Keep dependencies updated
- [ ] Enable audit logs
- [ ] Set up rate limiting
- [ ] Enable CORS restrictions
- [ ] Monitor credit usage
- [ ] Set up alerts for anomalies

## Production Maintenance

### Daily
- Monitor error rates
- Check API health
- Review credit usage

### Weekly
- Review analytics
- Check database performance
- Verify backups

### Monthly
- Update dependencies
- Review security logs
- Performance optimization
- Cost analysis

### Quarterly
- Full security audit
- Database optimization
- Dependency updates
- Capacity planning

## Rollback Procedure

If something goes wrong in production:

1. **Quick Rollback (Vercel):**
   ```bash
   vercel rollback
   ```

2. **Manual Rollback:**
   - Go to Vercel → Deployments
   - Find previous stable deployment
   - Click "..." → "Redeploy"

3. **Database Rollback (Supabase):**
   - Go to Settings → Backups
   - Find backup before issue
   - Request restore from support

## Support

For issues:
- Check [Vercel Status](https://www.vercel-status.com/)
- Check [Supabase Status](https://status.supabase.com/)
- Review [Next.js Documentation](https://nextjs.org/docs)
- Contact support with error logs

---

**Deployment Complete!** Your AI Chat MVP is now live in production.
