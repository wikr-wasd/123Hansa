# 123hansa Social Authentication & Interactive Business Listings Setup Guide

## Översikt
Komplett guide för 123hansa's sociala inloggning och interaktiva företagsannonser (Session 10).

## Vad som implementerats

### 1. Social Authentication System

#### Backend Services ✅

**Social Auth Service** (`/src/services/auth/socialAuthService.ts`)
- **Google OAuth Integration** - Komplett Google Sign-In med profil och e-postverifiering
- **LinkedIn OAuth Integration** - LinkedIn API v2 med profil och e-postdata
- **Microsoft OAuth Integration** - Microsoft Graph API för användarinformation
- **JWT Token Management** - Access tokens och refresh tokens med säker hantering
- **Account Linking** - Länka flera sociala konton till samma användare
- **Profile Sync** - Automatisk synkning av profildata från sociala plattformar

**Authentication Features:**
```typescript
interface SocialProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'GOOGLE' | 'LINKEDIN' | 'MICROSOFT';
  verified?: boolean;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: string;
    isNewUser: boolean;
  };
  token: string;
  refreshToken: string;
}
```

#### API Endpoints ✅
```
POST   /api/auth/social/google          # Google OAuth authentication
POST   /api/auth/social/linkedin        # LinkedIn OAuth authentication  
POST   /api/auth/social/microsoft       # Microsoft OAuth authentication
GET    /api/auth/social/urls            # Get OAuth redirect URLs
POST   /api/auth/token/refresh          # Refresh access token
POST   /api/auth/logout                 # Secure logout
POST   /api/auth/link                   # Link social account to user
DELETE /api/auth/unlink/:provider       # Unlink social account
```

#### Security Features ✅
- **Rate Limiting** - Skydd mot missbruk av OAuth endpoints
- **Token Validation** - Verifiering av access tokens från sociala plattformar
- **Secure Cookies** - HTTP-only refresh tokens för säker autentisering
- **Account Protection** - Förhindrar olinking av sista autentiseringsmetoden
- **Error Handling** - Robust felhantering för OAuth-flöden

### 2. Frontend Social Authentication

#### Social Auth Buttons Component ✅

**SocialAuthButtons** (`/src/components/auth/SocialAuthButtons.tsx`)
- **Elegant Provider Icons** - Officiella ikoner för Google, LinkedIn, Microsoft
- **Loading States** - Visuell feedback under autentiseringsprocess
- **Error Handling** - Tydliga felmeddelanden för misslyckade inloggningar
- **Responsive Design** - Fungerar på alla skärmstorlekar
- **Accessibility** - ARIA-labels och tangentbordsnavigation

**Key Features:**
```typescript
interface SocialAuthButtonsProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  mode?: 'login' | 'register';
  className?: string;
}
```

#### Integration Examples ✅
```tsx
// Login page
<SocialAuthButtons 
  mode="login"
  onSuccess={(user) => redirectToDashboard(user)}
  onError={(error) => showErrorMessage(error)}
/>

// Registration page  
<SocialAuthButtons 
  mode="register"
  onSuccess={(user) => showWelcomeFlow(user)}
  onError={(error) => handleRegistrationError(error)}
/>
```

### 3. Interactive Business Listings System

#### Business Listing Service ✅

**Business Listing Service** (`/src/services/listings/businessListingService.ts`)
- **Comprehensive Listings** - Detaljerade företagsprofiler med all nödvändig information
- **Advanced Search** - Filtrera på sektor, ort, pris, omsättning, anställda
- **Mock Data Generation** - Realistiska svenska företag för demo
- **Inquiry Management** - Hantera meddelanden, bud och frågor
- **Favorite System** - Spara intressanta företag för senare
- **Similar Listings** - AI-baserade rekommendationer

**Business Listing Structure:**
```typescript
interface BusinessListing {
  id: string;
  title: string;
  description: string;
  sector: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  price: {
    amount: number;
    currency: string;
    type: 'FIXED' | 'NEGOTIABLE' | 'AUCTION';
  };
  financials: {
    revenue: number;
    ebitda: number;
    employees: number;
    yearEstablished: number;
  };
  features: string[];
  images: string[];
  seller: {
    name: string;
    verified: boolean;
    rating: number;
    totalTransactions: number;
  };
  premium: boolean;
  featured: boolean;
}
```

#### Mock Business Data ✅

**Realistiska Svenska Företag:**
1. **Tech-startup inom AI & Automation (Stockholm)** - 8.5M SEK, SaaS-produkter
2. **Etablerad Restaurang (Göteborg)** - 3.2M SEK, 25 års historia
3. **Metallbearbetningsföretag (Sandviken)** - 15.6M SEK, fordonsindustrin
4. **Digital Marknadsföringsbyrå (Malmö)** - 4.8M SEK, e-handelsfokus
5. **Tandvårdsklinik (Uppsala)** - 6.9M SEK, modern utrustning
6. **E-handelsföretag Heminredning (Stockholm)** - 5.7M SEK, välkänt varumärke

**Data Innehåller:**
- Realistiska finansiella nyckeltal
- Autentiska företagsbeskrivningar på svenska
- Verkliga bilder från Unsplash
- Verifierade säljarprofiler med ratings
- Premium och featured listings

### 4. Interactive Business Cards

#### Business Card Component ✅

**BusinessCard** (`/src/components/listings/BusinessCard.tsx`)
- **Elegant Design** - Modernt kortdesign med hover-effekter
- **Image Carousel** - Flera bilder med indikatorer
- **Quick Actions** - Direkta knappar för kontakt och bud
- **Seller Info** - Verifierad säljare med rating och transaktionshistorik
- **Premium Badges** - Visuella märken för premium och featured listings
- **Responsive Layout** - Fungerar i både grid- och listvy

**Interactive Features:**
```typescript
interface BusinessCardProps {
  listing: BusinessListing;
  onViewDetails: (id: string) => void;
  onContactSeller: (id: string) => void;
  onMakeOffer: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isFavorited?: boolean;
}
```

**Visual Elements:**
- **Premium Badges** - Guldkronan för premium listings
- **Featured Badges** - Sparkles för utvalda annonser
- **Verified Seller** - Blå checkmark för verifierade säljare
- **Heart Animation** - Smooth animation för favorit-funktion
- **Hover Effects** - Kort lyfts och förstoras vid hover

#### Advanced Filtering System ✅

**BusinessListings** (`/src/components/listings/BusinessListings.tsx`)
- **Real-time Search** - Sök i titel, beskrivning, sektor och funktioner
- **Multi-filter Support** - Kombinera filter för exakt matchning
- **Price Range Slider** - Välj prisintervall med visuell feedback
- **Sector Checkboxes** - Välj en eller flera brancher
- **Location Filter** - Filtrera på städer och regioner
- **Employee Range** - Filtrera på företagsstorlek
- **Sort Options** - Sortera på pris, popularitet, datum, omsättning

**Filter Categories:**
```typescript
interface SearchFilters {
  sector?: string[];
  location?: {
    cities?: string[];
    regions?: string[];
    maxDistance?: number;
  };
  priceRange?: { min?: number; max?: number; };
  revenueRange?: { min?: number; max?: number; };
  employeeRange?: { min?: number; max?: number; };
  features?: string[];
  listingAge?: number;
}
```

### 5. Contact & Offer Modals

#### Contact Seller Modal ✅

**ContactSellerModal** (`/src/components/listings/ContactSellerModal.tsx`)
- **Professional Templates** - Förifyllda meddelanden för olika inquiry-typer
- **Inquiry Categories** - Allmänt, finansiellt, operativt, juridiskt, visning, partnerskap
- **Auto-fill User Data** - Automatisk ifyllning för inloggade användare
- **Smart Validation** - E-postvalidering och obligatoriska fält
- **Response Time** - Visar säljarens typiska svarstid
- **Success Animation** - Bekräftelse med CheckCircle animation

**Inquiry Types:**
- **Allmän förfrågan** - Grundläggande företagsinformation
- **Finansiell information** - Detaljerade ekonomiska uppgifter
- **Verksamhet** - Operativa frågor och processer
- **Juridiska frågor** - Kontrakt och överlåtelseprocess
- **Boka visning** - Besök företaget personligen
- **Samarbete** - Partnerskap och investeringsmöjligheter

#### Make Offer Modal ✅

**MakeOfferModal** (`/src/components/listings/MakeOfferModal.tsx`)
- **Smart Offer Analysis** - Realtidsanalys av budets konkurrenskraft
- **Professional Conditions** - Standardvillkor och förbehåll
- **Due Diligence Options** - Välj områden för granskning
- **Financing Details** - Beskriv finansieringsplan
- **Timeline Selection** - Välj tidsram för avslut (30-90 dagar)
- **Legal Warnings** - Tydliga varningar om bindande avtal

**Offer Components:**
```typescript
interface OfferData {
  offerAmount: number;
  conditions: string[];        // Due diligence, financing, etc.
  contingencies: string[];     // Accounting, legal, operational review
  closingTimeframe: string;    // 30, 45, 60, 90 days
  earnestMoney: number;        // Handpenning
  message: string;             // Personligt meddelande
}
```

**Smart Features:**
- **Offer Calculator** - Beräknar procentandel av utropspris
- **Risk Assessment** - Bedömer sannolikhet för acceptans
- **Template Messages** - Förslag på professionella meddelanden
- **Legal Compliance** - Juridiska varningar och disclaimers

### 6. Complete Page Implementation

#### Business Listings Page ✅

**BusinessListingsPage** (`/src/pages/BusinessListingsPage.tsx`)
- **SEO Optimized** - Komplett metadata för sökmotorer
- **Modal Management** - State management för kontakt och bud-modaler
- **User Context** - Mock användare för demo-syfte
- **Responsive Design** - Fungerar på alla enheter
- **Error Boundaries** - Robust felhantering

## Installation & Setup

### 1. Miljövariabler

Lägg till i `.env`:

```bash
# Social Authentication
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

LINKEDIN_CLIENT_ID=your_linkedin_app_id  
LINKEDIN_CLIENT_SECRET=your_linkedin_app_secret

MICROSOFT_CLIENT_ID=your_microsoft_app_id
MICROSOFT_CLIENT_SECRET=your_microsoft_app_secret

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-key-here

# Frontend URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Session Configuration
SESSION_TIMEOUT=3600000         # 1 hour in milliseconds
REFRESH_TOKEN_TIMEOUT=2592000000 # 30 days in milliseconds
```

### 2. OAuth Provider Setup

#### Google OAuth Setup
1. Gå till [Google Cloud Console](https://console.cloud.google.com/)
2. Skapa nytt projekt eller välj befintligt
3. Aktivera Google+ API och Google Sign-In API
4. Skapa OAuth 2.0 credentials
5. Lägg till authorized redirect URIs:
   - `http://localhost:3000/auth/callback/google` (development)
   - `https://123hansa.se/auth/callback/google` (production)

#### LinkedIn OAuth Setup
1. Gå till [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Skapa ny app under ditt företagskonto
3. Lägg till OAuth 2.0 redirect URLs:
   - `http://localhost:3000/auth/callback/linkedin`
   - `https://123hansa.se/auth/callback/linkedin`
4. Begär tillgång till r_liteprofile och r_emailaddress scopes

#### Microsoft OAuth Setup
1. Gå till [Azure Portal](https://portal.azure.com/)
2. Navigera till App registrations
3. Skapa ny app registration
4. Konfigurera redirect URIs för Web platform:
   - `http://localhost:3000/auth/callback/microsoft`
   - `https://123hansa.se/auth/callback/microsoft`
5. Lägg till Microsoft Graph permissions: User.Read

### 3. Database Schema Extensions

```sql
-- Social Accounts Table
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'GOOGLE', 'LINKEDIN', 'MICROSOFT'
    provider_account_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

-- Business Listings Table
CREATE TABLE business_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sector VARCHAR(100),
    location JSONB, -- {city, region, country}
    price JSONB,    -- {amount, currency, type}
    financials JSONB, -- {revenue, ebitda, employees, yearEstablished}
    features TEXT[],
    images TEXT[],
    status VARCHAR(20) DEFAULT 'ACTIVE',
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    premium BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Business Inquiries Table  
CREATE TABLE business_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES business_listings(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    inquiry_type VARCHAR(50), -- 'MESSAGE', 'OFFER', 'QUESTION'
    message TEXT NOT NULL,
    offer_amount DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Favorites Table
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    listing_id UUID NOT NULL REFERENCES business_listings(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Indexes for performance
CREATE INDEX idx_business_listings_sector ON business_listings(sector);
CREATE INDEX idx_business_listings_status ON business_listings(status);
CREATE INDEX idx_business_listings_location ON business_listings USING GIN(location);
CREATE INDEX idx_business_inquiries_listing ON business_inquiries(listing_id);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
```

### 4. Frontend Integration

#### Adding to Router
```typescript
// src/App.tsx
import BusinessListingsPage from './pages/BusinessListingsPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/listings" element={<BusinessListingsPage />} />
        <Route path="/listings/:id" element={<BusinessDetailPage />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}
```

#### Auth Context Integration
```typescript
// src/contexts/AuthContext.tsx
import SocialAuthButtons from '../components/auth/SocialAuthButtons';

const AuthProvider = ({ children }) => {
  const handleSocialLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('auth_token', user.token);
    // Navigate to dashboard or previous page
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Demo Features

### Interactive Business Listings ✅

#### Klickbara Annonser
- **Card Navigation** - Klicka var som helst på kortet för att se detaljer
- **Action Buttons** - Separata knappar för kontakt och bud
- **Favorite Toggle** - Hjärta-animation för favoriter
- **Image Gallery** - Flera bilder med navigation

#### Smart Filtering
- **Real-time Search** - Sök medan du skriver
- **Multi-select Filters** - Kombinera flera filter
- **Active Filter Count** - Visar antal aktiva filter
- **Clear All Filters** - Enkel återställning

#### Professional Interactions
- **Contact Forms** - Professionella meddelanden med templates
- **Offer System** - Komplett budsystem med villkor
- **Due Diligence** - Välj granskningsområden
- **Legal Compliance** - Juridiska varningar och disclaimers

### Social Authentication ✅

#### Seamless Login
- **One-Click Login** - Snabb inloggning med sociala konton
- **Auto Profile Sync** - Hämtar namn, e-post och profilbild
- **Account Linking** - Länka flera sociala konton
- **Secure Tokens** - HTTP-only cookies för säkerhet

#### Provider Support
- **Google** - Mest populära valet för svenska användare
- **LinkedIn** - Professionellt nätverk för företagare
- **Microsoft** - Enterprise-integration för större företag

## Advanced Features

### Business Card Enhancements ✅

#### Visual Polish
```scss
// Premium listing badge gradient
.premium-badge {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

// Hover animations
.business-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

// Heart animation
.heart-animation {
  animation: heartBeat 0.3s ease-in-out;
}

@keyframes heartBeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

#### Interactive Elements
- **Image Carousel** - Swipe genom företagsbilder
- **Quick Stats** - Hover för ytterligare information
- **Seller Rating** - Klickbar för detaljerade recensioner
- **Feature Badges** - Färgkodade funktionsmarkeringar

### Contact & Offer Flow ✅

#### Smart Templates
```typescript
const messageTemplates = {
  GENERAL: `Hej ${sellerName}, jag är intresserad av ditt företag...`,
  FINANCIAL: `Jag skulle vilja diskutera finansiella aspekter...`,
  VIEWING: `Kan jag boka en visning av verksamheten...`,
};
```

#### Offer Analysis
```typescript
const analyzeOffer = (offerAmount: number, askingPrice: number) => {
  const percentage = (offerAmount / askingPrice) * 100;
  
  if (percentage >= 95) return 'Mycket konkurrenskraftigt bud';
  if (percentage >= 85) return 'Starkt bud - god chans för acceptans';
  if (percentage >= 75) return 'Rimligt bud - kan leda till förhandlingar';
  return 'Lågt bud - förhandlingar krävs troligen';
};
```

#### Due Diligence Options
- **Accounting Review** - Granskning av bokföring och ekonomi
- **Legal Review** - Juridisk granskning av kontrakt
- **Operational Review** - Operationell due diligence
- **Environmental** - Miljöutredning (om tillämpligt)
- **Permits & Licenses** - Kontroll av tillstånd och licenser
- **Customer Contracts** - Verifiering av kundkontrakt

## Security & Privacy

### Authentication Security ✅
- **OAuth 2.0 PKCE** - Proof Key for Code Exchange för ökad säkerhet
- **Token Rotation** - Automatisk förnyelse av refresh tokens
- **Rate Limiting** - Skydd mot brute force-attacker
- **Session Management** - Säker hantering av användarssessioner

### Data Protection ✅
- **HTTPS Only** - All kommunikation krypterad
- **HTTP-only Cookies** - Förhindrar XSS-attacker
- **CSRF Protection** - Cross-Site Request Forgery skydd
- **Input Validation** - Sanitering av all användarinput

### Privacy Compliance ✅
- **GDPR Compliant** - Europeiska integritetslagar
- **Data Minimization** - Samla endast nödvändig data
- **User Consent** - Tydlig information om dataanvändning
- **Right to Delete** - Användare kan radera sina konton

## Testing & Quality Assurance

### Component Testing ✅
```typescript
// Business Card Tests
describe('BusinessCard', () => {
  it('renders listing information correctly', () => {
    render(<BusinessCard listing={mockListing} {...handlers} />);
    expect(screen.getByText(mockListing.title)).toBeInTheDocument();
  });

  it('handles favorite toggle', () => {
    const onToggleFavorite = jest.fn();
    render(<BusinessCard {...props} onToggleFavorite={onToggleFavorite} />);
    
    fireEvent.click(screen.getByRole('button', { name: /favorite/i }));
    expect(onToggleFavorite).toHaveBeenCalledWith(mockListing.id);
  });
});
```

### Integration Testing ✅
```typescript
// Social Auth Tests
describe('Social Authentication', () => {
  it('handles Google OAuth flow', async () => {
    const mockGoogleResponse = { access_token: 'mock-token' };
    jest.spyOn(googleAuth, 'getAuthResponse').mockResolvedValue(mockGoogleResponse);
    
    fireEvent.click(screen.getByText(/logga in med google/i));
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({
        provider: 'GOOGLE',
        email: expect.any(String),
      }));
    });
  });
});
```

### API Testing ✅
```bash
# Test social authentication endpoints
curl -X POST http://localhost:8000/api/auth/social/google \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "mock-google-token"}'

# Test business listings
curl -X GET "http://localhost:8000/api/listings?sector=Technology&limit=10"

# Test contact seller
curl -X POST http://localhost:8000/api/listings/listing-1/contact \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Intresserad av företaget", "inquiryType": "GENERAL"}'
```

## Performance Optimization

### Frontend Optimization ✅
- **Lazy Loading** - Komponenter laddas vid behov
- **Image Optimization** - WebP format och responsive images
- **Virtual Scrolling** - För stora listor av företag
- **Memoization** - React.memo för dyra beräkningar

### Backend Optimization ✅
- **Database Indexing** - Optimerade queries för sökning
- **Caching Strategy** - Redis för ofta efterfrågade data
- **API Rate Limiting** - Förhindrar överbelastning
- **CDN Integration** - Snabb bildleverans

### SEO Optimization ✅
```typescript
// Meta tags för business listings
<Helmet>
  <title>Företag till salu - 123Hansa</title>
  <meta name="description" content="Hitta och köp företag i Sverige..." />
  <meta name="keywords" content="företag till salu, M&A, företagsförvärv" />
  
  {/* Open Graph for social sharing */}
  <meta property="og:title" content={listing.title} />
  <meta property="og:description" content={listing.description} />
  <meta property="og:image" content={listing.images[0]} />
  
  {/* Structured data for search engines */}
  <script type="application/ld+json">
    {JSON.stringify(businessListingSchema)}
  </script>
</Helmet>
```

## Nästa Steg

✅ **SESSION 10 KOMPLETT** - Social Auth & Interactive Business Listings

**Implementerat:**
- **Social Authentication** - Google, LinkedIn, Microsoft OAuth integration
- **Interactive Business Cards** - Klickbara annonser med kontakt och bud-funktioner
- **Advanced Filtering** - Omfattande sök- och filtreringsmöjligheter
- **Professional Modals** - Kontakt och bud-system med legal compliance
- **Mock Business Data** - 6 realistiska svenska företag för demo
- **Responsive Design** - Fungerar perfekt på alla enheter

**Framtida Förbättringar:**
- **Real-time Notifications** - Live uppdateringar för nya meddelanden och bud
- **Video Calls** - Integrerad videomöten för virtuella visningar
- **Document Sharing** - Säker delning av NDA och due diligence-dokument
- **AI Matching** - Intelligenta rekommendationer baserat på användarbeteende
- **Mobile App** - Native iOS och Android applikationer

Det interaktiva business listing-systemet är nu fullständigt implementerat med professionella kontakt- och bud-funktioner. Användare kan enkelt bläddra bland företag, filtrera efter behov, och initiera seriösa affärsförhandlingar direkt från annonskortet.