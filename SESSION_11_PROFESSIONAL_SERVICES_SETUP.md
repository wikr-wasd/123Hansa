# Session 11: Professional Services System - Setup Guide

## Overview

Session 11 introduces a comprehensive Professional Services system to the 123hansa platform, enabling businesses to connect with verified experts for consultations, business brokerage, legal services, and specialized business advice. This system transforms 123hansa from a pure marketplace into a full-service business ecosystem.

## System Architecture

### Backend Infrastructure

#### Database Schema Extensions
- **ProfessionalProfile**: Core professional information and verification
- **ServiceListing**: Professional service offerings with pricing
- **ServiceBooking**: Consultation bookings and scheduling
- **ConsultationRequest**: Consultation requests from clients
- **ProfessionalReview**: Review and rating system
- **ServicePayment**: Payment tracking for professional services

#### Service Layer
- **Professional Services**: Profile management, search, verification
- **Service Listing Services**: CRUD operations, recommendations
- **Booking Services**: Scheduling, conflict detection, statistics
- **Consultation Services**: Request management, matching, notifications
- **Review Services**: Rating management, moderation, responses

#### API Controllers
- **Professional Controller**: Profile and search endpoints
- **Service Listing Controller**: Service management endpoints
- **Booking Controller**: Consultation booking endpoints
- **Consultation Controller**: Request management endpoints
- **Review Controller**: Review and rating endpoints

### Frontend Components

#### Core Components
- **ExpertDirectory**: Professional search and filtering
- **ProfessionalCard**: Professional display in multiple variants
- **ProfessionalProfile**: Detailed professional profiles
- **ConsultationBooking**: Multi-step booking wizard
- **ServiceListing**: Service display components

#### Review System
- **ReviewForm**: Comprehensive review submission
- **ReviewDisplay**: Professional review rendering
- **ReviewManager**: Review management and filtering
- **ReviewResponse**: Professional response system
- **ReviewSummary**: Review statistics widgets

## Installation Steps

### 1. Database Migration

Run the Prisma migration to add Professional Services schema:

```bash
cd apps/api
npx prisma db push
npx prisma generate
```

### 2. Environment Configuration

Add the following environment variables to `.env`:

```env
# Professional Services Configuration
PROFESSIONAL_VERIFICATION_REQUIRED=true
CONSULTATION_BOOKING_ENABLED=true
REVIEW_MODERATION_ENABLED=true
COMMISSION_RATE=0.05
STRIPE_PROFESSIONAL_ACCOUNT_TYPE=express

# Email Templates
CONSULTATION_REQUEST_TEMPLATE_ID=template_consultation_request
CONSULTATION_ACCEPTED_TEMPLATE_ID=template_consultation_accepted
REVIEW_REQUEST_TEMPLATE_ID=template_review_request
```

### 3. Service Dependencies

Install required packages:

```bash
# API Dependencies
cd apps/api
npm install @stripe/stripe-js stripe
npm install node-cron
npm install sharp

# Web Dependencies
cd apps/web
npm install lucide-react
npm install react-hook-form
npm install @headlessui/react
```

### 4. File Structure

Ensure the following file structure exists:

```
apps/
├── api/
│   ├── src/
│   │   ├── services/professionals/
│   │   │   ├── professionalService.ts
│   │   │   ├── serviceListingService.ts
│   │   │   ├── bookingService.ts
│   │   │   ├── consultationService.ts
│   │   │   └── reviewService.ts
│   │   ├── controllers/professionals/
│   │   │   ├── professionalController.ts
│   │   │   ├── serviceListingController.ts
│   │   │   ├── bookingController.ts
│   │   │   ├── consultationController.ts
│   │   │   └── reviewController.ts
│   │   └── routes/
│   │       └── professionals.ts
│   └── prisma/
│       └── schema.prisma (updated)
└── web/
    └── src/
        └── components/professionals/
            ├── ExpertDirectory.tsx
            ├── ProfessionalCard.tsx
            ├── ProfessionalProfile.tsx
            ├── ConsultationBooking.tsx
            ├── ServiceListing.tsx
            ├── ReviewForm.tsx
            ├── ReviewDisplay.tsx
            ├── ReviewManager.tsx
            ├── ReviewResponse.tsx
            └── ReviewSummary.tsx
```

## Configuration

### 1. API Routes Setup

Add to your main API router:

```typescript
import professionalRoutes from './routes/professionals';

app.use('/api/professionals', professionalRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/reviews', reviewRoutes);
```

### 2. Authentication Middleware

Ensure proper authentication for professional endpoints:

```typescript
// Protected professional routes
router.use('/api/professionals/profile', authenticateToken);
router.use('/api/consultations', authenticateToken);
router.use('/api/reviews', authenticateToken);
```

### 3. Rate Limiting

Configure rate limiting for professional services:

```typescript
import rateLimit from 'express-rate-limit';

const professionalSearchLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many search requests'
});

router.use('/api/professionals/search', professionalSearchLimit);
```

## User Roles and Permissions

### Professional User Types
- **LEGAL_ADVISOR**: Legal services and contract review
- **BUSINESS_BROKER**: Business sale/acquisition brokerage
- **ACCOUNTANT**: Accounting and tax services
- **FINANCIAL_ADVISOR**: Financial consulting and planning
- **CONSULTANT**: General business consulting
- **VALUATION_EXPERT**: Business and asset valuation

### Service Categories
- **LEGAL_SERVICES**: Legal advice and representation
- **BUSINESS_BROKERAGE**: Business buying/selling
- **FINANCIAL_ADVISORY**: Financial planning and advice
- **ACCOUNTING**: Bookkeeping and tax preparation
- **BUSINESS_CONSULTING**: Strategy and operations
- **DUE_DILIGENCE**: Business investigation and analysis
- **VALUATION_SERVICES**: Asset and business valuation
- **TAX_ADVISORY**: Tax planning and compliance
- **MERGER_ACQUISITION**: M&A advisory services
- **CONTRACT_REVIEW**: Legal document review

## Features

### 1. Expert Directory
- Advanced search and filtering
- Professional verification badges
- Real-time availability status
- Category-based browsing
- Location and language filtering

### 2. Consultation Booking
- Multi-step booking wizard
- Calendar integration
- Conflict detection
- Multiple consultation formats (video, phone, in-person)
- Automatic scheduling confirmations

### 3. Professional Profiles
- Comprehensive profile management
- Credential verification
- Experience showcase
- Service portfolio
- Client testimonials

### 4. Review System
- Detailed rating categories
- Professional responses
- Review moderation
- Helpful vote system
- Review statistics

### 5. Service Listings
- Detailed service descriptions
- Flexible pricing models
- Consultation format options
- Prerequisite specifications
- Deliverable tracking

## Security Considerations

### 1. Data Protection
- Encryption of sensitive professional data
- GDPR compliance for professional profiles
- Secure document handling for consultations
- PCI compliance for payment processing

### 2. Verification Process
- Identity verification for professionals
- Credential validation
- Background check integration
- Ongoing compliance monitoring

### 3. Payment Security
- Stripe Connect for professional payments
- Escrow system for high-value consultations
- Fraud detection and prevention
- Automated commission calculations

## Testing

### 1. Backend Testing

Run API tests:

```bash
cd apps/api
npm run test:professionals
npm run test:bookings
npm run test:reviews
```

### 2. Frontend Testing

Test React components:

```bash
cd apps/web
npm run test -- --testPathPattern=professionals
```

### 3. Integration Testing

Test full user flows:

```bash
npm run test:e2e:professionals
```

## Monitoring and Analytics

### 1. Key Metrics
- Professional sign-up rate
- Consultation booking conversion
- Average consultation value
- Review completion rate
- Professional response time

### 2. Performance Monitoring
- API response times
- Database query performance
- Search functionality speed
- Booking completion rate

### 3. Business Intelligence
- Revenue per professional
- Popular service categories
- Geographical distribution
- Seasonal trends

## Deployment Checklist

### Pre-Deployment
- [ ] Database migration completed
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Frontend components functional
- [ ] Payment system configured
- [ ] Email templates setup
- [ ] Security audit completed

### Post-Deployment
- [ ] Professional onboarding flow tested
- [ ] Booking system operational
- [ ] Review system functional
- [ ] Payment processing verified
- [ ] Monitoring dashboards active
- [ ] Customer support trained

## Support and Maintenance

### 1. Professional Onboarding
- Verification process guidance
- Profile optimization tips
- Service listing best practices
- Pricing strategy advice

### 2. Client Support
- Booking assistance
- Consultation preparation
- Payment issue resolution
- Review dispute handling

### 3. System Maintenance
- Regular data backups
- Performance optimization
- Security updates
- Feature enhancements

## Future Enhancements

### Phase 2 Features
- Video consultation platform integration
- Advanced matching algorithms
- Professional certification programs
- Automated quality scoring

### Phase 3 Features
- AI-powered service recommendations
- Blockchain-based credential verification
- International payment support
- Mobile app development

## Documentation Links

- [Professional Services API Documentation](./api-docs/professionals.md)
- [Review System Guide](./guides/review-system.md)
- [Booking System Documentation](./guides/booking-system.md)
- [Payment Integration Guide](./guides/payments.md)
- [Security Best Practices](./security/professional-services.md)

## Contact Information

For technical support or questions regarding the Professional Services system:
- **Development Team**: dev@tubba.se
- **Product Manager**: product@tubba.se
- **Security Team**: security@tubba.se

---

**Last Updated**: Session 11 Implementation
**Version**: 1.0.0
**Status**: Production Ready