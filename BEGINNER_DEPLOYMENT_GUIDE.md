# 🚀 Complete Beginner's Guide: Deploy 123hansa.se to Production

## 🎯 What You're Building
123hansa.se is a business marketplace where Swedish entrepreneurs can buy and sell businesses. Think of it as "Blocket for business sales" or "Swedish Flippa" - a platform where someone selling a restaurant can find someone wanting to buy one.

**Your app includes:**
- 🏪 Business listing marketplace
- 👥 User accounts and verification  
- 💬 Messaging between buyers/sellers
- 💳 Payment processing (Stripe + Swedish methods)
- 🛡️ Admin panel for moderation
- 📊 Analytics and reporting

---

## 📋 What You Need Before Starting

### ⏰ Time Required
- **Total time**: 2-4 hours (for first deployment)
- **Ongoing cost**: $20-50/month to start

### 💻 Skills Needed
- Basic computer skills
- Ability to copy/paste commands
- Patience to follow instructions step-by-step

### 🎯 End Goal
A live website at `https://123hansa.se` that people can use to buy/sell businesses in Sweden.

---

# 🛠️ Step 1: Set Up External Services (60-90 minutes)

*Why: Your app needs external services to handle databases, emails, payments, etc. It's like building a house - you need electricity, water, and internet connections.*

## 1.1 🌐 Buy Your Domain Name (5 minutes)

**What it is:** Your web address (like google.com or facebook.com)  
**Why you need it:** People need a way to find your website  
**Cost:** $10-30/year

**Instructions:**
1. Go to [Namecheap.com](https://namecheap.com) or [GoDaddy.com](https://godaddy.com)
2. Search for "123hansa.se" (or your preferred Swedish domain)
3. If available, purchase it
4. **Important:** Write down your login credentials

**Alternative domains if 123hansa.se is taken:**
- 123hansa.nu
- 123hansa.com  
- 123hansamarketplace.se

✅ **You're done when:** You own the domain and can log into your domain account

---

## 1.2 🗄️ Set Up Your Database (15 minutes)

**What it is:** Where your app stores user accounts, business listings, messages  
**Why you need it:** Like a filing cabinet for all your website's data  
**Cost:** Free to start, $25/month when you get bigger

**Instructions:**
1. Go to [Supabase.com](https://supabase.com)
2. Click "Start your project" → "Sign up"
3. Create account using GitHub or email
4. Click "New Project"
5. Fill out:
   - **Project name:** "hansa123-production"
   - **Database password:** Create a strong password (save it!)
   - **Region:** Europe (closest to Sweden)
6. Wait 2-3 minutes for setup
7. Go to Settings → Database
8. Copy the "Connection string" (starts with `postgresql://`)

**Save this info:**
```
Database URL: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

✅ **You're done when:** You have your database connection string saved

---

## 1.3 📧 Set Up Email Service (10 minutes)

**What it is:** Service to send emails (welcome messages, password resets, notifications)  
**Why you need it:** Users need to receive emails when they register, reset passwords, etc.  
**Cost:** Free for 100 emails/day, $15/month for more

**Instructions:**
1. Go to [SendGrid.com](https://sendgrid.com)
2. Click "Try for Free" → Create account
3. Verify your email address
4. Complete the "Get Started" checklist:
   - Choose "Integrate using Web API"
   - Skip domain verification for now (we'll do this later)
5. Go to Settings → API Keys
6. Click "Create API Key"
7. Name it "hansa123-production"
8. Select "Full Access"
9. Copy the API key (starts with `SG.`)

**Save this info:**
```
SendGrid API Key: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

✅ **You're done when:** You have your SendGrid API key saved

---

## 1.4 💳 Set Up Payment Processing (20 minutes)

**What it is:** Handles money transactions safely  
**Why you need it:** When someone pays for a business listing or transaction fees  
**Cost:** 2.9% + 30¢ per transaction (only when you make money)

**Instructions:**
1. Go to [Stripe.com](https://stripe.com)
2. Click "Start now" → Create account
3. Choose "Sweden" as your country
4. Fill in your business information:
   - Business type: "Individual" or "Company"
   - Industry: "Marketplaces"
   - Your personal/business details
5. Complete identity verification (required for live payments)
6. Go to Developers → API keys
7. **Important:** Toggle "View test data" to OFF (you want live keys)
8. Copy both keys:
   - Publishable key (starts with `pk_live_`)
   - Secret key (starts with `sk_live_`)

**Save this info:**
```
Stripe Publishable Key: pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Stripe Secret Key: sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Important:** Only use LIVE keys (not test keys) for production

✅ **You're done when:** You have both live Stripe keys saved

---

## 1.5 🗂️ Set Up File Storage (15 minutes)

**What it is:** Where uploaded images and documents are stored  
**Why you need it:** Business listings need photos, users upload documents  
**Cost:** ~$1-5/month for typical usage

**Instructions:**
1. Go to [AWS.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Complete registration (requires credit card, but you won't be charged much)
4. After signing in, search for "S3" in the search bar
5. Click "Create bucket"
6. Settings:
   - **Bucket name:** "hansa123-uploads" (must be globally unique)
   - **Region:** "Europe (Stockholm)" eu-north-1
   - **Block all public access:** UNCHECK this (we need public access for images)
   - Create bucket
7. Now create an IAM user:
   - Search for "IAM" in AWS
   - Click "Users" → "Add user"
   - **Username:** "hansa123-app"
   - **Access type:** Programmatic access
   - **Permissions:** Attach existing policies → "AmazonS3FullAccess"
   - Complete creation
   - **IMPORTANT:** Download the CSV with your keys

**Save this info:**
```
AWS Access Key ID: AKIAxxxxxxxxxxxxxxxx
AWS Secret Access Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS S3 Bucket: hansa123-uploads
AWS Region: eu-north-1
```

✅ **You're done when:** You have AWS keys and bucket name saved

---

## 1.6 🚨 Set Up Error Monitoring (5 minutes)

**What it is:** Tells you when your app crashes or has errors  
**Why you need it:** So you know immediately when something breaks  
**Cost:** Free for 5,000 errors/month

**Instructions:**
1. Go to [Sentry.io](https://sentry.io)
2. Sign up with GitHub or email
3. Choose "Node.js" as your platform
4. Project name: "hansa123-production"
5. Copy the DSN (looks like a URL)

**Save this info:**
```
Sentry DSN: https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@sentry.io/xxxxxxx
```

✅ **You're done when:** You have your Sentry DSN saved

---

# 🚀 Step 2: Deploy Your Code (30-45 minutes)

*Why: Your code is currently only on your computer. We need to put it on the internet so people can use it.*

## 2.1 📁 Push Code to GitHub (10 minutes)

**What it is:** Online storage for your code  
**Why you need it:** Vercel (hosting) needs to access your code from GitHub

**Instructions:**
1. Go to [GitHub.com](https://github.com) and create account
2. Click "New repository"
   - **Repository name:** "hansa123-marketplace"
   - **Description:** "123hansa.se - Swedish Business Marketplace"
   - Set to **Public** (private requires paid plan)
   - Don't initialize with README (you already have code)
3. Click "Create repository"
4. Copy the commands GitHub shows you
5. Open terminal in your project folder:

```bash
# Navigate to your project
cd /home/willi/tubba-project

# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial 123hansa.se production-ready code"

# Add GitHub as remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/hansa123-marketplace.git

# Push to GitHub
git branch -M main
git push -u origin main
```

✅ **You're done when:** Your code appears on GitHub.com in your repository

---

## 2.2 🌐 Deploy to Vercel (15 minutes)

**What it is:** Hosting service that makes your app live on the internet  
**Why you need it:** So people can visit your website  
**Cost:** Free for hobby projects, $20/month for production features

**Instructions:**
1. Go to [Vercel.com](https://vercel.com)
2. Click "Start Deploying" → "Continue with GitHub"
3. Authorize Vercel to access your GitHub
4. Click "Import Project"
5. Find your "hansa123-marketplace" repository → "Import"
6. Vercel will detect it's a monorepo. Configure:
   - **Framework Preset:** "Other"
   - **Root Directory:** Leave blank
   - **Build Command:** `npm run build`
   - **Output Directory:** Leave blank
7. Click "Deploy"
8. Wait 2-5 minutes for first deployment

✅ **You're done when:** Vercel shows "Your project has been deployed" with a URL

---

## 2.3 🔧 Configure Environment Variables (20 minutes)

**What it is:** Secret settings and API keys your app needs  
**Why you need it:** Your app needs to know how to connect to database, send emails, etc.

**Instructions:**
1. In Vercel, go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable below (click "Add" for each one):

**Required Variables (add these one by one):**

```bash
# Database
DATABASE_URL
postgresql://postgres:YOUR-SUPABASE-PASSWORD@db.YOUR-PROJECT.supabase.co:5432/postgres

# Security  
JWT_SECRET
your-super-secure-random-32-character-string-here-make-it-long

# Email
EMAIL_API_KEY
SG.your-sendgrid-api-key-here

EMAIL_FROM_ADDRESS
noreply@123hansa.se

# Payments
STRIPE_SECRET_KEY
sk_live_your-stripe-secret-key

STRIPE_PUBLISHABLE_KEY
pk_live_your-stripe-publishable-key

# File Storage
AWS_ACCESS_KEY_ID
your-aws-access-key-id

AWS_SECRET_ACCESS_KEY
your-aws-secret-access-key

AWS_S3_BUCKET
hansa123-uploads

AWS_REGION
eu-north-1

# Monitoring
SENTRY_DSN
https://your-sentry-dsn@sentry.io/project-id

# CORS (replace with your actual domain)
CORS_ORIGINS
https://123hansa.se,https://www.123hansa.se

# Production settings
NODE_ENV
production

ENABLE_CACHING
true
```

**How to generate JWT_SECRET:**
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. After adding all variables, click "Redeploy" in the Deployments tab

✅ **You're done when:** All environment variables are added and deployment succeeds

---

# 🗄️ Step 3: Set Up Your Database Structure (15 minutes)

*Why: Your database is empty. We need to create tables for users, listings, messages, etc.*

## 3.1 Create Database Tables (10 minutes)

**Instructions:**
1. In Vercel, go to your project
2. Click "Functions" tab → find your API function
3. Click the function → "View Function Logs"
4. In a new terminal on your computer:

```bash
cd /home/willi/tubba-project/apps/api

# Install dependencies if needed
npm install

# Set your database URL (replace with your actual URL)
export DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT.supabase.co:5432/postgres"

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

✅ **You're done when:** Commands complete without errors

## 3.2 Verify Database Connection (5 minutes)

**Instructions:**
1. Visit your Vercel app URL + `/health` 
   - Example: `https://your-app-name.vercel.app/health`
2. You should see JSON with `"status": "healthy"`
3. Look for `"database": {"connected": true}`

✅ **You're done when:** Health check shows database connected

---

# 🌐 Step 4: Connect Your Domain (15 minutes)

*Why: Instead of the random Vercel URL, you want people to visit 123hansa.se*

## 4.1 Point Domain to Vercel (10 minutes)

**Instructions:**
1. Log into your domain registrar (where you bought 123hansa.se)
2. Find "DNS Management" or "Nameservers"
3. Add these DNS records:

**Type A Record:**
- **Name/Host:** @ (or blank)
- **Value:** 76.76.19.61
- **TTL:** 3600

**Type CNAME Record:**
- **Name/Host:** www
- **Value:** cname.vercel-dns.com
- **TTL:** 3600

4. Save DNS changes

## 4.2 Add Domain to Vercel (5 minutes)

**Instructions:**
1. In Vercel, go to project settings → "Domains"
2. Add domain: "123hansa.se"
3. Add domain: "www.123hansa.se"
4. Vercel will verify and set up SSL automatically
5. Wait 5-30 minutes for DNS propagation

✅ **You're done when:** `https://123hansa.se` loads your website

---

# ✅ Step 5: Test Everything Works (20 minutes)

*Why: Make sure all the pieces work together before announcing your launch*

## 5.1 Test User Flow (10 minutes)

**Test these features:**
1. **Homepage:** Visit `https://123hansa.se` - should load
2. **Registration:** Create a new user account
3. **Email:** Check if you received a welcome email
4. **Login:** Log in with your new account
5. **Create Listing:** Try creating a test business listing
6. **File Upload:** Upload a test image to your listing
7. **Admin Panel:** Visit `https://123hansa.se/kraken` and log in as admin

## 5.2 Test API Endpoints (5 minutes)

**Check these URLs work:**
- `https://123hansa.se/health` - should show healthy status
- `https://123hansa.se/api/listings` - should show listings (may be empty)
- `https://123hansa.se/sitemap.xml` - should show sitemap

## 5.3 Test Performance (5 minutes)

**Use Google PageSpeed Insights:**
1. Go to [PageSpeed Insights](https://pagespeed.web.dev/)
2. Test your URL: `https://123hansa.se`
3. Should score 80+ on performance

✅ **You're done when:** All tests pass and site feels fast

---

# 🎉 Step 6: Go Live! (15 minutes)

*Why: Make final preparations and announce your marketplace*

## 6.1 Final Configuration (10 minutes)

**Update these settings:**
1. In Vercel environment variables, update:
   - `CORS_ORIGINS` to your real domain: `https://123hansa.se,https://www.123hansa.se`
2. In SendGrid, verify your domain:
   - Go to Settings → Sender Authentication
   - Verify 123hansa.se domain
3. Test email sending works

## 6.2 Launch Checklist (5 minutes)

**Before announcing:**
- [ ] Website loads at 123hansa.se
- [ ] Users can register and login  
- [ ] Business listings can be created
- [ ] Images upload successfully
- [ ] Admin panel accessible
- [ ] Error monitoring working (check Sentry)
- [ ] All external services connected

✅ **You're done when:** Everything on the checklist works!

---

# 💰 Cost Breakdown

## Monthly Costs (approximate):

| Service | Free Tier | Paid Plan | When You Need Paid |
|---------|-----------|-----------|-------------------|
| **Domain** | - | $2-5/month | Immediately |
| **Database (Supabase)** | 500MB free | $25/month | ~1000 users |
| **Email (SendGrid)** | 100 emails/day | $15/month | >100 emails/day |
| **Payments (Stripe)** | 2.9% + 30¢ per transaction | Same | Per transaction |
| **File Storage (AWS S3)** | 5GB free for 12 months | $1-10/month | After 12 months |
| **Hosting (Vercel)** | Free for hobby | $20/month | Need custom domains |
| **Monitoring (Sentry)** | 5,000 errors/month | $26/month | >5,000 errors/month |

**Total to start:** $25-50/month  
**Total at scale:** $80-150/month

---

# 🚨 Common Issues & Solutions

## "Database connection failed"
**Fix:** Check your DATABASE_URL environment variable is correct

## "CORS error" in browser
**Fix:** Make sure CORS_ORIGINS includes your domain with https://

## "Emails not sending"
**Fix:** Verify your domain in SendGrid and check API key

## "Images not uploading"
**Fix:** Check AWS S3 bucket permissions and API keys

## "Payment not working"
**Fix:** Make sure you're using LIVE Stripe keys, not test keys

---

# 🎯 What's Next?

## Immediate (Week 1):
- [ ] Create your first admin user
- [ ] Add some sample business listings
- [ ] Test the complete buy/sell flow
- [ ] Set up Google Analytics (optional)

## Short-term (Month 1):
- [ ] Get feedback from 5-10 test users
- [ ] Fix any bugs they find
- [ ] Add more business categories
- [ ] Start marketing to Swedish entrepreneurs

## Long-term (6 months):
- [ ] Scale infrastructure as you grow
- [ ] Add Swedish payment methods (Swish, etc.)
- [ ] Implement BankID verification
- [ ] Add more advanced features

---

# 🆘 Need Help?

## If something doesn't work:
1. **Check the logs:** In Vercel → Functions → View logs
2. **Check Sentry:** See if there are error reports
3. **Verify environment variables:** Make sure all keys are correct
4. **Test one piece at a time:** Isolate what's not working

## Resources:
- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase Guides:** [supabase.com/docs](https://supabase.com/docs)
- **Stripe Documentation:** [stripe.com/docs](https://stripe.com/docs)

---

**🎉 Congratulations! You now have a production-ready Swedish business marketplace running at 123hansa.se!**

*Your platform is ready to help Swedish entrepreneurs buy and sell businesses. Time to get your first users and start building the community!*