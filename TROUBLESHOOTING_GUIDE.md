# 🛠️ 123hansa.se Troubleshooting Guide

*When things don't work as expected - solutions to common problems*

---

## 🚨 Critical Issues (Site Down)

### ❌ "Application Error" on Vercel
**Symptoms:** Website shows "Application Error" message  
**Causes:** Code deployment failed or environment variables missing

**How to fix:**
1. Go to Vercel dashboard → your project → "Functions"
2. Click on your API function → "View Function Logs"
3. Look for error messages (usually red text)
4. Common fixes:
   - Missing environment variable → Add it in Vercel settings
   - Database connection failed → Check DATABASE_URL
   - Build failed → Check your code for syntax errors

### ❌ "This site can't be reached"
**Symptoms:** Browser says domain doesn't exist  
**Causes:** DNS not configured or still propagating

**How to fix:**
1. Check DNS settings in your domain registrar
2. Verify these records exist:
   - A record: @ → 76.76.19.61
   - CNAME: www → cname.vercel-dns.com
3. Wait 24 hours for DNS propagation
4. Test with [DNS checker](https://dnschecker.org)

---

## 🗄️ Database Issues

### ❌ "Database connection failed"
**Symptoms:** Health check shows database disconnected  
**Error message:** "failed to connect to database"

**How to fix:**
1. Check DATABASE_URL in Vercel environment variables
2. Make sure URL format is correct:
   ```
   postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres
   ```
3. In Supabase:
   - Go to Settings → Database
   - Copy the connection string again
   - Make sure password is correct
4. Redeploy in Vercel after fixing

### ❌ "Table 'users' doesn't exist"
**Symptoms:** App loads but crashes when trying to use features  
**Causes:** Database migrations haven't been run

**How to fix:**
1. Open terminal on your computer:
   ```bash
   cd /home/willi/tubba-project/apps/api
   export DATABASE_URL="your-supabase-url-here"
   npx prisma migrate deploy
   npx prisma generate
   ```
2. If migrations fail, check your database permissions
3. Verify tables exist in Supabase dashboard → Table Editor

---

## 📧 Email Issues

### ❌ Emails not being sent
**Symptoms:** Users don't receive welcome emails, password resets  
**Causes:** SendGrid not configured or domain not verified

**How to fix:**
1. Check SendGrid API key in Vercel environment variables
2. In SendGrid dashboard:
   - Go to Settings → Sender Authentication
   - Verify your domain 123hansa.se
   - Add DNS records they provide
3. Test sending email manually:
   - Go to SendGrid → Email API → Integration Guide
   - Send test email
4. Check SendGrid activity feed for failed sends

### ❌ "Authentication failed" email error
**Symptoms:** Email logs show authentication errors  
**Causes:** Wrong API key or SendGrid account issues

**How to fix:**
1. Generate new API key in SendGrid
2. Make sure it has "Full Access" permissions
3. Update EMAIL_API_KEY in Vercel
4. Redeploy application

---

## 💳 Payment Issues

### ❌ "Payment failed" or Stripe errors
**Symptoms:** Payment button doesn't work  
**Causes:** Using test keys in production or wrong configuration

**How to fix:**
1. In Stripe dashboard, make sure "View test data" is OFF
2. Copy LIVE API keys (they start with pk_live_ and sk_live_)
3. Update these in Vercel environment variables:
   - STRIPE_SECRET_KEY
   - STRIPE_PUBLISHABLE_KEY
4. Test with a real credit card (charge yourself $1 to test)

### ❌ "Stripe webhook failed"
**Symptoms:** Payments complete but don't show in app  
**Causes:** Webhook not configured or wrong endpoint

**How to fix:**
1. In Stripe dashboard → Developers → Webhooks
2. Add endpoint: `https://123hansa.se/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret and add as STRIPE_WEBHOOK_SECRET in Vercel

---

## 🗂️ File Upload Issues

### ❌ "Failed to upload image"
**Symptoms:** Business listing images won't upload  
**Causes:** AWS S3 not configured or wrong permissions

**How to fix:**
1. Check AWS credentials in Vercel environment variables
2. In AWS S3:
   - Go to your bucket (123hansa-uploads)
   - Permissions → Bucket Policy
   - Add this policy (replace BUCKET-NAME):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::BUCKET-NAME/*"
       }
     ]
   }
   ```
3. Test upload manually in AWS console

### ❌ "Access Denied" S3 error
**Symptoms:** Upload starts but fails with permission error  
**Causes:** IAM user doesn't have S3 permissions

**How to fix:**
1. In AWS IAM → Users → your-user
2. Add permissions → Attach existing policies
3. Add "AmazonS3FullAccess"
4. Generate new access keys if needed

---

## 🔒 Authentication Issues

### ❌ "Invalid JWT token"
**Symptoms:** Users can't stay logged in  
**Causes:** JWT_SECRET not set or incorrect

**How to fix:**
1. Generate new JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Add as JWT_SECRET in Vercel environment variables
3. Redeploy application
4. Users will need to log in again

### ❌ Admin panel not accessible
**Symptoms:** Can't access /kraken admin page  
**Causes:** No admin user created or wrong credentials

**How to fix:**
1. Create admin user through database:
   - Go to Supabase → Table Editor → users
   - Find your user account
   - Change role from "USER" to "ADMIN"
2. Or use Prisma Studio:
   ```bash
   cd apps/api
   npx prisma studio
   ```

---

## 🌐 Performance Issues

### ❌ Website loading slowly
**Symptoms:** Pages take >3 seconds to load  
**Causes:** Database queries not optimized or caching disabled

**How to fix:**
1. Check if caching is enabled:
   - ENABLE_CACHING=true in environment variables
2. Set up Redis for better caching:
   - Get Redis instance (Redis Labs, Upstash)
   - Add REDIS_URL environment variable
3. Monitor performance:
   - Check /metrics endpoint
   - Use Google PageSpeed Insights

### ❌ "Too Many Requests" errors
**Symptoms:** Users getting rate limited  
**Causes:** Rate limits too strict

**How to fix:**
1. Increase rate limits in environment variables:
   - API_RATE_LIMIT=2000 (from 1000)
   - AUTH_RATE_LIMIT=30 (from 15)
2. Redeploy application

---

## 🐛 Development Issues

### ❌ "Module not found" errors
**Symptoms:** Build fails with missing module errors  
**Causes:** Dependencies not installed or wrong versions

**How to fix:**
1. Clean install dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Check package.json for correct versions
3. Commit and push changes to trigger redeploy

### ❌ TypeScript compilation errors
**Symptoms:** Build fails with type errors  
**Causes:** TypeScript configuration or type mismatches

**How to fix:**
1. Run type check locally:
   ```bash
   npm run type-check
   ```
2. Fix any type errors shown
3. Make sure all files use correct types

---

## 🔍 How to Debug Issues

### Step 1: Check the Logs
1. **Vercel Logs:**
   - Go to project → Functions → View Function Logs
   - Look for red error messages
2. **Browser Console:**
   - Press F12 → Console tab
   - Look for JavaScript errors
3. **Sentry Dashboard:**
   - Check for new error reports
   - See stack traces and user impact

### Step 2: Test Individual Components
1. **Database:** Visit /health endpoint
2. **API:** Visit /api/listings endpoint  
3. **Files:** Try uploading an image
4. **Email:** Try password reset
5. **Payments:** Try test transaction

### Step 3: Verify Environment Variables
1. In Vercel → Settings → Environment Variables
2. Make sure all required variables are set
3. Check for typos in variable names
4. Ensure no trailing spaces in values

### Step 4: Test Locally
1. Copy all environment variables to local .env file
2. Run `npm run dev` locally
3. If it works locally but not in production, it's a deployment issue

---

## 📞 When to Contact Support

### Contact Vercel Support if:
- Deployment keeps failing with no clear error
- Custom domain not working after 24 hours
- Billing or account issues

### Contact Service Provider Support if:
- **Supabase:** Database performance issues
- **SendGrid:** Email delivery problems  
- **Stripe:** Payment processing issues
- **AWS:** Storage or billing problems

### Before Contacting Support:
1. Try the solutions in this guide
2. Check service status pages for outages
3. Have your error logs ready
4. Know your account details

---

## 📋 Prevention Checklist

**To avoid future issues:**
- [ ] Set up monitoring alerts in Sentry
- [ ] Monitor your service usage/limits
- [ ] Keep backups of important data
- [ ] Test major changes in development first
- [ ] Document any custom configurations
- [ ] Keep service credentials secure and up to date

---

**Remember: Most issues are configuration problems, not code problems. Work through this guide systematically and you'll get your marketplace running smoothly! 🚀**