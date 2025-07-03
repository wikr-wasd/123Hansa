# 🚀 123hansa.se Deployment Checklist

*Print this page and check off each item as you complete it*

## 📋 Before You Start
- [ ] I have 2-4 hours available
- [ ] I have a credit card for service signups
- [ ] I have access to my computer terminal/command line

---

## 🛠️ Step 1: External Services Setup

### 🌐 Domain Name (5 min)
- [ ] Purchased domain (123hansa.se or alternative)
- [ ] Saved domain registrar login credentials
- **Domain:** ________________________________

### 🗄️ Database (15 min)
- [ ] Created Supabase account
- [ ] Created project "123hansa-production"
- [ ] Copied connection string
- **Database URL:** ________________________________

### 📧 Email Service (10 min)
- [ ] Created SendGrid account
- [ ] Got API key
- [ ] Saved API key securely
- **SendGrid API Key:** ________________________________

### 💳 Payment Processing (20 min)
- [ ] Created Stripe account
- [ ] Completed business verification
- [ ] Got LIVE API keys (not test!)
- [ ] Toggled OFF "View test data"
- **Stripe Publishable Key:** ________________________________
- **Stripe Secret Key:** ________________________________

### 🗂️ File Storage (15 min)
- [ ] Created AWS account
- [ ] Created S3 bucket "123hansa-uploads"
- [ ] Created IAM user with S3 access
- [ ] Downloaded credentials CSV
- **AWS Access Key:** ________________________________
- **AWS Secret Key:** ________________________________

### 🚨 Error Monitoring (5 min)
- [ ] Created Sentry account
- [ ] Created project "123hansa-production"
- [ ] Copied DSN
- **Sentry DSN:** ________________________________

---

## 🚀 Step 2: Code Deployment

### 📁 GitHub Setup (10 min)
- [ ] Created GitHub account
- [ ] Created repository "123hansa-marketplace"
- [ ] Pushed code to GitHub
- [ ] Code visible on GitHub.com

### 🌐 Vercel Deployment (15 min)
- [ ] Created Vercel account
- [ ] Connected to GitHub
- [ ] Imported project
- [ ] First deployment successful
- **Vercel URL:** ________________________________

### 🔧 Environment Variables (20 min)
- [ ] Added DATABASE_URL
- [ ] Added JWT_SECRET (generated random 32-char string)
- [ ] Added EMAIL_API_KEY
- [ ] Added EMAIL_FROM_ADDRESS
- [ ] Added STRIPE_SECRET_KEY
- [ ] Added STRIPE_PUBLISHABLE_KEY
- [ ] Added AWS_ACCESS_KEY_ID
- [ ] Added AWS_SECRET_ACCESS_KEY
- [ ] Added AWS_S3_BUCKET
- [ ] Added AWS_REGION
- [ ] Added SENTRY_DSN
- [ ] Added CORS_ORIGINS
- [ ] Added NODE_ENV=production
- [ ] Added ENABLE_CACHING=true
- [ ] Redeployed after adding variables

---

## 🗄️ Step 3: Database Setup

### Database Migration (15 min)
- [ ] Ran `npx prisma migrate deploy`
- [ ] Ran `npx prisma generate`
- [ ] Commands completed without errors
- [ ] Health check shows database connected

---

## 🌐 Step 4: Domain Configuration

### DNS Setup (15 min)
- [ ] Added A record: @ → 76.76.19.61
- [ ] Added CNAME record: www → cname.vercel-dns.com
- [ ] Added domain to Vercel
- [ ] SSL certificate automatically configured
- [ ] Website loads at https://123hansa.se

---

## ✅ Step 5: Testing

### User Flow Testing (20 min)
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Welcome email received
- [ ] User login works
- [ ] Can create business listing
- [ ] Image upload works
- [ ] Admin panel accessible at /kraken

### Technical Testing
- [ ] /health endpoint shows healthy status
- [ ] /api/listings endpoint works
- [ ] PageSpeed Insights score 80+
- [ ] No console errors in browser

---

## 🎉 Step 6: Go Live

### Final Configuration (15 min)
- [ ] Updated CORS_ORIGINS to real domain
- [ ] Verified domain in SendGrid
- [ ] Tested email sending
- [ ] All checklist items completed

### Launch Preparation
- [ ] Created admin user account
- [ ] Added sample business listings
- [ ] Tested complete user journey
- [ ] Ready to announce!

---

## 💾 Important Information to Save

**Keep this information secure and accessible:**

| Service | Login URL | Username/Email | Notes |
|---------|-----------|----------------|-------|
| Domain Registrar | | | |
| Supabase | supabase.com | | Database |
| SendGrid | sendgrid.com | | Email |
| Stripe | stripe.com | | Payments |
| AWS | aws.amazon.com | | File Storage |
| Sentry | sentry.io | | Error Monitoring |
| GitHub | github.com | | Code Repository |
| Vercel | vercel.com | | Hosting |

---

## 🚨 Emergency Contacts & Resources

**If something breaks:**
1. Check Vercel function logs
2. Check Sentry for errors
3. Verify environment variables
4. Test individual components

**Support Resources:**
- Vercel Support: vercel.com/support
- Supabase Discord: supabase.com/discord
- Stripe Support: support.stripe.com

---

**🎯 Success Criteria:**
- ✅ Website loads at https://123hansa.se
- ✅ Users can register and create listings
- ✅ All external services connected
- ✅ No critical errors in monitoring

**Time to celebrate! 🎉 Your Swedish business marketplace is live!**