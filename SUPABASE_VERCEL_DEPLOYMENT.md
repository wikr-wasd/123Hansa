# 🚀 123hansa.se - Supabase + Vercel Deployment Guide

## Database Choice: Supabase ✅
## Framework Setting: "Other" ✅

---

## 🎯 Why This Setup is Perfect for Your Marketplace

### **Supabase Benefits for 123hansa.se:**
- ✅ **PostgreSQL** with full-text search for business listings
- ✅ **Real-time subscriptions** for messaging between buyers/sellers
- ✅ **Built-in file storage** for business photos/documents
- ✅ **Scalable** to 1000+ users with predictable pricing
- ✅ **European servers** (good for Swedish users)
- ✅ **Management dashboard** for easy database administration

### **Vercel "Other" Framework Benefits:**
- ✅ **Custom monorepo** support (apps/web + apps/api)
- ✅ **Optimized vercel.json** configuration preserved
- ✅ **Global CDN** for fast loading worldwide
- ✅ **Automatic SSL** and domain management
- ✅ **Serverless scaling** for traffic spikes

---

## 📋 Step-by-Step Implementation

### Phase 1: Setup Supabase Database (15 minutes)

#### 1.1 Create Supabase Project
1. Go to [Supabase.com](https://supabase.com)
2. Click "Start your project" → Sign up
3. Create new project:
   - **Name**: `123hansa-production`
   - **Database Password**: Create strong password (save it!)
   - **Region**: `Europe (EU Central)` (closest to Sweden)
4. Wait 2-3 minutes for setup

#### 1.2 Get Database Connection
1. In Supabase dashboard → Settings → Database
2. Copy the **Connection string** (Connection pooling):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
   ```
3. **Important**: Use the pooling connection (port 6543) for production

#### 1.3 Configure Database Schema
1. In your terminal, navigate to your project:
   ```bash
   cd /home/willi/tubba-project/apps/api
   ```

2. Set your database URL:
   ```bash
   export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"
   ```

3. Run migrations to create all tables:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. Verify tables were created:
   - Go to Supabase → Table Editor
   - You should see all your tables (users, business_listings, etc.)

---

### Phase 2: Deploy to Vercel (20 minutes)

#### 2.1 Connect GitHub to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Click "Import Project"
4. Find your `123hansa-marketplace` repository
5. Click "Import"

#### 2.2 Configure Framework Settings
**IMPORTANT**: When Vercel asks for framework preset:
- ✅ Select **"Other"** 
- ❌ DO NOT select React, Next.js, or Node.js
- ✅ Leave build settings empty (vercel.json will handle this)

Why "Other"?
- Your project has custom monorepo structure
- vercel.json is already optimized
- Framework presets would override your configuration

#### 2.3 Add Environment Variables
In Vercel project settings → Environment Variables, add these:

**Required for Production:**
```bash
# Database
DATABASE_URL
postgresql://postgres:[YOUR-SUPABASE-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true

# Security
JWT_SECRET
[generate-32-character-random-string]

# Email (SendGrid)
EMAIL_API_KEY
SG.[your-sendgrid-api-key]

EMAIL_FROM_ADDRESS
noreply@123hansa.se

# Payments (Stripe)
STRIPE_SECRET_KEY
sk_live_[your-stripe-secret-key]

STRIPE_PUBLISHABLE_KEY
pk_live_[your-stripe-publishable-key]

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID
[your-aws-access-key]

AWS_SECRET_ACCESS_KEY
[your-aws-secret-key]

AWS_S3_BUCKET
123hansa-uploads

AWS_REGION
eu-north-1

# CORS (update after you get domain)
CORS_ORIGINS
https://123hansa.se,https://www.123hansa.se

# Production settings
NODE_ENV
production

ENABLE_CACHING
true
```

#### 2.4 Deploy
1. Click "Deploy" in Vercel
2. Wait 3-5 minutes for build
3. Test the deployment URL works

---

### Phase 3: Domain Configuration (15 minutes)

#### 3.1 Add Domain to Vercel
1. In Vercel project → Settings → Domains
2. Add domain: `123hansa.se`
3. Add domain: `www.123hansa.se`
4. Vercel will show DNS instructions

#### 3.2 Configure DNS
In your domain registrar (where you bought 123hansa.se):

**Add these DNS records:**
```
Type: A
Name: @
Value: 76.76.19.61
TTL: 3600

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### 3.3 Update CORS
1. After domain is working, update CORS_ORIGINS in Vercel:
   ```
   CORS_ORIGINS=https://123hansa.se,https://www.123hansa.se
   ```
2. Redeploy the project

---

## ✅ Testing Your Deployment

### Test 1: Basic Functionality
- [ ] Visit `https://123hansa.se` - homepage loads
- [ ] Try creating user account
- [ ] Check if you receive welcome email
- [ ] Try logging in

### Test 2: Database Connection
- [ ] Visit `https://123hansa.se/health` - should show database connected
- [ ] Create a test business listing
- [ ] Check if listing appears on site

### Test 3: File Uploads
- [ ] Try uploading image to business listing
- [ ] Verify image appears correctly

### Test 4: Admin Panel
- [ ] Visit `https://123hansa.se/kraken`
- [ ] Log in with admin credentials
- [ ] Verify admin functionality works

---

## 💰 Cost Breakdown

### Supabase Costs:
- **Free tier**: 500MB database, 2GB bandwidth
- **Pro tier**: $25/month (2GB database, 100GB bandwidth)
- **Upgrade when**: You hit limits (around 1000+ users)

### Vercel Costs:
- **Hobby**: Free (personal projects)
- **Pro**: $20/month (custom domains, more bandwidth)
- **Team**: $99/month (multiple team members)

### AWS S3 Costs:
- **First 12 months**: 5GB free
- **After**: ~$1-5/month for typical usage

**Total monthly cost**: $25-50 to start, scales with usage

---

## 🚨 Common Issues & Solutions

### Issue: "Database connection failed"
**Solution**: 
- Check DATABASE_URL is correct
- Make sure you're using the pooling connection (port 6543)
- Verify password doesn't have special characters

### Issue: "Vercel build failed"
**Solution**:
- Check you selected "Other" framework
- Verify all environment variables are set
- Look at build logs for specific errors

### Issue: "CORS errors"
**Solution**:
- Update CORS_ORIGINS to your actual domain
- Make sure both www and non-www versions are included

### Issue: "Images not uploading"
**Solution**:
- Check AWS S3 credentials
- Verify bucket permissions allow public read
- Test S3 connection manually

---

## 🔧 Advanced Configuration

### Real-time Features (Optional)
To enable real-time messaging using Supabase:

1. In Supabase → API → Realtime
2. Enable for tables you want real-time updates
3. Update your React components to use Supabase realtime

### Performance Optimization
1. **Database**: Add connection pooling (already configured)
2. **CDN**: Enable Vercel's CDN (automatic)
3. **Caching**: Redis integration (optional upgrade)

### Monitoring
1. **Supabase**: Built-in monitoring dashboard
2. **Vercel**: Built-in analytics and performance monitoring
3. **Sentry**: Error tracking (already configured)

---

## 📞 Support Resources

### Supabase:
- **Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Discord**: [supabase.com/discord](https://supabase.com/discord)
- **Status**: [status.supabase.com](https://status.supabase.com)

### Vercel:
- **Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Support**: [vercel.com/support](https://vercel.com/support)
- **Status**: [vercel-status.com](https://vercel-status.com)

---

## 🎉 Success Criteria

When everything is working correctly:

✅ **Website**: https://123hansa.se loads perfectly  
✅ **Database**: All functionality works (users, listings, etc.)  
✅ **Real-time**: Fast loading and real-time updates  
✅ **Scalable**: Ready for 1000+ users  
✅ **Secure**: HTTPS, security headers, data protection  
✅ **Maintainable**: Easy to manage via dashboards  

**Your Swedish business marketplace is now production-ready! 🇸🇪🚀**

---

## 🔄 What's Next?

### Immediate (Week 1):
- [ ] Test all functionality thoroughly
- [ ] Create admin user account
- [ ] Add sample business listings
- [ ] Set up monitoring alerts

### Short-term (Month 1):
- [ ] Optimize based on user feedback
- [ ] Add Swedish payment methods (Swish, etc.)
- [ ] Implement BankID verification
- [ ] Scale infrastructure as needed

### Long-term (6+ months):
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] AI-powered business matching
- [ ] Expansion to other Nordic countries

**You now have a world-class business marketplace platform! 🌟**