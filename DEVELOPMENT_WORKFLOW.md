# 123Hansa Development Workflow Guide

## 🌟 Overview

This guide outlines the development, staging, and production workflow for the 123Hansa marketplace platform.

## 🏗️ Environment Structure

```
┌─ Local Development (localhost:3002)
├─ Staging Environment (staging-123hansa.vercel.app)
└─ Production Environment (123hansa.vercel.app)
```

## 🔄 Git Branch Strategy

### Branch Structure
```
main (production)           → 123hansa.vercel.app
├── staging                 → staging-123hansa.vercel.app
├── feature/your-feature    → feature-your-feature-123hansa.vercel.app
└── hotfix/urgent-fix       → hotfix-urgent-fix-123hansa.vercel.app
```

### Branch Purposes
- **`main`**: Production-ready code, automatically deploys to live site
- **`staging`**: Pre-production testing, automatically deploys to staging site
- **`feature/*`**: Feature development, creates preview deployments
- **`hotfix/*`**: Urgent production fixes, creates preview deployments

## 🚀 Development Workflow

### 1. Starting New Feature Development

```bash
# Ensure you're on latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-awesome-feature

# Start local development
npm run dev
```

### 2. Local Development

```bash
# Full development environment
npm run dev                    # Starts both API (3001) + Web (3002)
npm run dev:web               # Web only
npm run dev:api               # API only

# Building for different environments
npm run build:development    # Development build
npm run build:staging        # Staging build  
npm run build:production     # Production build
```

### 3. Testing Your Changes

```bash
# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Build verification
npm run build:development
```

### 4. Push Feature for Review

```bash
# Add and commit changes
git add .
git commit -m "feat: your awesome feature description"

# Push feature branch
git push origin feature/your-awesome-feature
```

**Result**: Vercel automatically creates a preview deployment at:
`https://feature-your-awesome-feature-123hansa.vercel.app`

### 5. Deploy to Staging

```bash
# Switch to staging branch
git checkout staging
git pull origin staging

# Merge your feature
git merge feature/your-awesome-feature

# Deploy to staging
npm run deploy:staging
```

**Result**: Changes are live at `https://staging-123hansa.vercel.app`

### 6. Deploy to Production

```bash
# Switch to main branch
git checkout main
git pull origin main

# Merge from staging
git merge staging

# Deploy to production
npm run deploy:production
```

**Result**: Changes are live at `https://123hansa.vercel.app`

## 🔧 Environment Configuration

### Environment Files

```
apps/web/
├── .env                    # Local overrides (gitignored)
├── .env.development       # Development defaults
├── .env.staging          # Staging configuration
└── .env.production       # Production configuration
```

### Key Environment Variables

#### **Development**
```bash
NODE_ENV=development
VITE_API_URL=http://localhost:3001/api
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK_DATA=true
```

#### **Staging**
```bash
NODE_ENV=staging
VITE_API_URL=https://staging-123hansa.vercel.app/api
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK_DATA=false
```

#### **Production**
```bash
NODE_ENV=production
VITE_API_URL=https://123hansa.vercel.app/api
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_DATA=false
```

## 🏃‍♂️ Quick Commands

### Daily Development
```bash
# Start coding session
git checkout main && git pull && git checkout -b feature/new-feature
npm run dev

# Test and commit
npm run test && npm run lint
git add . && git commit -m "feat: description"
git push origin feature/new-feature
```

### Deploy to Staging
```bash
git checkout staging && git pull
git merge feature/new-feature
npm run deploy:staging
```

### Deploy to Production
```bash
git checkout main && git pull
git merge staging
npm run deploy:production
```

## 🔍 Testing Strategy

### Local Testing
- **Unit Tests**: `npm run test`
- **Component Tests**: Run in browser at `http://localhost:3002`
- **API Tests**: Manual testing against local API
- **Build Tests**: `npm run build:development`

### Staging Testing
- **Integration Tests**: Full app testing on staging URL
- **User Acceptance Testing**: Share staging URL with team/clients
- **Performance Testing**: Lighthouse CI on staging
- **Cross-browser Testing**: Test on different browsers/devices

### Production Testing
- **Smoke Tests**: Verify critical paths work
- **Monitoring**: Check Sentry/analytics for errors
- **Health Checks**: `npm run health-check`

## 🚨 Hotfix Workflow

For urgent production fixes:

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/urgent-fix-description

# Make minimal fix
# ... edit files ...

# Test locally
npm run test
npm run build:production

# Deploy directly to main (skip staging for emergencies)
git checkout main
git merge hotfix/urgent-fix-description
npm run deploy:production

# Sync staging with the fix
git checkout staging
git merge main
npm run deploy:staging
```

## 📦 Vercel Configuration

### Production Project Settings
- **Project Name**: `123hansa-production`
- **Git Branch**: `main`
- **Domain**: `123hansa.vercel.app`
- **Environment**: Production variables
- **Config File**: `vercel.json`

### Staging Project Settings
- **Project Name**: `123hansa-staging`
- **Git Branch**: `staging`
- **Domain**: `staging-123hansa.vercel.app`
- **Environment**: Staging variables
- **Config File**: `vercel.staging.json`

## ⚠️ Best Practices

### Do's ✅
- Always test locally before pushing
- Use descriptive commit messages
- Test on staging before production
- Keep feature branches small and focused
- Update environment variables in Vercel dashboard
- Use conventional commit messages (`feat:`, `fix:`, `docs:`, etc.)

### Don'ts ❌
- Never push directly to main without testing
- Don't commit sensitive data (API keys, passwords)
- Don't skip staging environment for significant changes
- Don't use production data in development/staging
- Don't commit `node_modules` or build artifacts

## 🆘 Troubleshooting

### Common Issues

#### Build Fails on Vercel
1. Check environment variables are set correctly
2. Verify all dependencies are in `package.json`
3. Check TypeScript errors in the build logs

#### Environment Variables Not Working
1. Ensure variables are prefixed with `VITE_` for frontend
2. Check Vercel dashboard environment variable settings
3. Verify correct environment file is being used

#### Deploy Not Updating
1. Check branch is correctly configured in Vercel
2. Verify git push was successful
3. Check Vercel deployment logs for errors

### Getting Help
- Check deployment logs in Vercel dashboard
- Review error messages in console/Network tab
- Check Sentry for production error reports
- Ask team in development chat

## 📊 Monitoring & Analytics

### Development
- Console logs and React DevTools
- Hot reload for instant feedback
- Local error reporting

### Staging
- Staging analytics (test tracking IDs)
- Error reporting to staging Sentry
- Performance monitoring enabled

### Production
- Live analytics and tracking
- Production error monitoring
- Performance metrics and alerts
- User behavior tracking

---

**Happy coding! 🚀**

For questions or improvements to this workflow, please create an issue or reach out to the development team.