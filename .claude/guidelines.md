# Tubba Project Guidelines for Development

## Technical Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with Helmet for security
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: JWT tokens + BankID integration
- **File Storage**: AWS S3 compatible (MinIO for local development)
- **Payment Processing**: Stripe + Swedish payment methods (Swish, etc.)
- **Email Service**: SendGrid or similar for transactional emails

### Frontend
- **Framework**: React 18+ with TypeScript and Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand for client state, React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router v6
- **Charts**: Recharts for business analytics
- **Internationalization**: i18next for Swedish/English support

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for local development
- **Hosting**: Railway/Render for staging, dedicated servers for production
- **CDN**: Cloudflare for static assets and DDoS protection
- **Monitoring**: Sentry for error tracking, Plausible for analytics

## Architecture Patterns

### Monorepo Structure
```
tubba-project/
├── apps/
│   ├── web/          # React frontend
│   ├── api/          # Express.js backend
│   └── admin/        # Admin dashboard
├── packages/
│   ├── shared/       # Shared utilities and types
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configuration
└── docs/             # Documentation
```

### Database Design Principles
- **Normalization**: Follow 3NF for business data integrity
- **Indexing**: Strategic indexes for query performance
- **Audit Trails**: Track all changes to sensitive business data
- **Soft Deletes**: Never permanently delete business records
- **UUID Primary Keys**: For better security and scalability

### API Design Standards
- **RESTful Endpoints**: Follow REST conventions consistently
- **Versioning**: API versions (v1, v2) for backward compatibility
- **Rate Limiting**: Prevent abuse with tiered rate limits
- **Input Validation**: Validate all inputs with Zod schemas
- **Error Handling**: Consistent error response format
- **Documentation**: OpenAPI/Swagger for all endpoints

## Security Requirements

### Authentication & Authorization
- **Multi-Factor Authentication**: Required for high-value transactions
- **Role-Based Access Control**: Admin, Seller, Buyer, Moderator roles
- **Session Management**: Secure JWT tokens with refresh mechanism
- **BankID Integration**: For Swedish user verification
- **Password Requirements**: Strong password policies

### Data Protection
- **Encryption**: AES-256 for sensitive data at rest
- **TLS 1.3**: All communications encrypted in transit
- **GDPR Compliance**: Data minimization, right to deletion, consent management
- **PCI DSS**: For payment card data handling
- **Regular Audits**: Quarterly security assessments

### Business Logic Security
- **Transaction Verification**: Multi-step verification for large transactions
- **KYC/AML Compliance**: Know Your Customer and Anti-Money Laundering
- **Document Verification**: Automated + manual review for business documents
- **Fraud Detection**: ML-based suspicious activity monitoring

## Code Quality Standards

### TypeScript Configuration
- **Strict Mode**: Enable all strict type checking options
- **ESLint**: Airbnb config with custom rules for consistency
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for linting and testing

### Testing Strategy
- **Unit Tests**: Jest for business logic (80%+ coverage)
- **Integration Tests**: Supertest for API endpoints
- **E2E Tests**: Playwright for critical user journeys
- **Visual Testing**: Chromatic for UI component regression

### Performance Standards
- **Page Load Time**: < 2 seconds on 3G networks
- **Database Queries**: < 100ms for simple queries, < 1s for complex
- **Bundle Size**: < 500KB initial JavaScript bundle
- **Lighthouse Score**: 90+ for Performance, Accessibility, SEO

## Swedish Market Compliance

### Localization Requirements
- **Language**: Swedish primary, English secondary
- **Currency**: SEK with EUR/USD display options
- **Date/Time**: Swedish format (DD/MM/YYYY)
- **Address Format**: Swedish postal code system
- **Phone Numbers**: Swedish mobile format validation

### Business Regulations
- **Aktiebolag (AB)**: Support for Swedish corporation transfers
- **Bolagsverket Integration**: Company registration verification
- **Tax Compliance**: VAT handling for business transactions
- **Legal Documentation**: Standard Swedish business transfer templates

### Payment Integration
- **Swish**: Mobile payment integration
- **BankID**: Authentication and digital signing
- **Klarna**: Installment payments for larger transactions
- **SEPA**: European bank transfers
- **Traditional Banks**: Handelsbanken, SEB, Swedbank integrations

## Development Workflow

### Git Workflow
- **Main Branch**: Always deployable production code
- **Feature Branches**: Feature-specific development
- **Pull Requests**: Required for all changes with code review
- **Conventional Commits**: Structured commit messages
- **Semantic Versioning**: Release version management

### Deployment Pipeline
- **Development**: Auto-deploy feature branches to preview environments
- **Staging**: Manual deployment for QA testing
- **Production**: Manual deployment with rollback capability
- **Database Migrations**: Reversible migrations with backup procedures

### Documentation Requirements
- **API Documentation**: Complete OpenAPI specifications
- **Component Documentation**: Storybook for UI components
- **Architecture Decisions**: ADR documents for major technical decisions
- **User Guides**: End-user documentation for business features