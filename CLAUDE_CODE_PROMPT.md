# 123Hansa.se - Claude Code Implementation Prompt

## 🎯 Projektöversikt
123Hansa.se är en nordisk marknadsplats för affärshandel. Vi behöver implementera flera kritiska funktioner för att göra plattformen helt funktionell och GDPR-kompatibel.

## 📱 Högsta Prioritet: Mobil Responsivitet och App-liknande Upplevelse

### Krav:
- **Mobil-först design**: Sidan ska visas som en app i struktur på mobila enheter
- **Interaktiv och intuitiv UX**: Mycket bra användarupplevelse på mobile
- **PWA-funktioner**: Installbar som app, offline-kapacitet
- **Touch-vänliga interaktioner**: Swipe-gester, touch-optimerade kontroller
- **Responsiv design**: Seamless övergång mellan desktop och mobil

### Tekniska Krav:
- Implementera PWA med service worker
- Responsive breakpoints (sm, md, lg, xl)
- Mobile-first CSS approach
- Touch gesture support
- Bottom sheet modals för mobil
- App-like navigation (bottom tab bar)

## 💬 Support Chat System

### Funktioner:
- **Tre kanaler**: Support, Kundtjänst, Marknadsföring
- **Real-time messaging** med Socket.IO
- **Chat-bubbla** som är alltid tillgänglig
- **Automatisk routing** till rätt avdelning
- **Fildelning** i chat
- **Chat-historik** och konversationshantering

### Tekniska Krav:
- Integrera med befintlig Socket.IO implementation
- Skapa chat-widget som overlay
- Implementera kanal-routing logik
- Admin-dashboard för support-medarbetare
- Real-time notifikationer

## 👤 Kontohantering och GDPR-Compliance

### Funktioner som ska implementeras:

#### 1. Radera Konto
- **Fullständig kontoradering** med data-rensning
- **Bekräftelse-process** med säkerhetskontroller
- **Data retention policy** enligt GDPR
- **Notifikation** till användaren om process

#### 2. Ladda Ner Data
- **Komplett dataexport** av användarens data
- **GDPR-kompatibel** dataexport
- **JSON/CSV format** för all användardata
- **Inkludera**: Profil, meddelanden, annonser, transaktioner

#### 3. GDPR och Cookies
- **Cookie-banner** med granulär kontroll
- **Cookiehantering** enligt EU-regler
- **Integritetsinställningar** för användaren
- **Samtycke-hantering** för databehandling
- **Återkallelse av samtycke** funktionalitet

### Tekniska Krav:
- Implementera GDPR data controllers
- Skapa cookie consent management
- Data export service
- Account deletion service med cascading deletes
- Privacy policy integration

## 📨 Förbättrat Meddelande System

### Krav:
- **Snygg funktionalitet** för både kunder och admin
- **Professionell design** som matchar admin-panelen
- **Real-time uppdateringar** och statusindikationer
- **Meddelandetrådar** och konversationshantering
- **Sök och filter** funktioner
- **Fil-bilagor** och media-stöd

### Tekniska Krav:
- Förbättra befintliga messaging-komponenter
- Implementera message threading
- Skapa admin-stil för meddelanden
- Real-time sync med Socket.IO
- Search och filter API

## 📊 Mina Annonser - Admin Panel Stil

### Funktioner:
- **Admin-panel tema** för kundens annons-hantering
- **Interaktiv dashboard** med data-visualisering
- **Annons-statistik** och analys
- **Hantera annonser** som admin (edit, delete, promote)
- **Bulk-operationer** för flera annonser

### Tekniska Krav:
- Återanvänd admin-panel styling
- Implementera customer-specific funktioner
- Skapa analytics dashboard
- Bulk operations API
- Data visualization komponenter

## 🏠 Kundens Översikt - Interaktiv Dashboard

### Krav:
- **Mer som admin** med data-visualisering
- **Interaktiva element** och real-time uppdateringar
- **Statistik och analys** av användarens aktivitet
- **Snabb-åtgärder** för vanliga uppgifter
- **Notifikations-center** integrerat

### Tekniska Krav:
- Skapa dashboard komponenter
- Implementera analytics API
- Real-time data updates
- Interactive charts och graphs
- Notification management system

## 🔧 Tekniska Specifikationer

### Styling och Tema:
- **Använd befintliga Nordic colors** från tailwind.config.js
- **Konsistent design** med admin-panelen
- **Responsiv design** för alla skärmstorlekar
- **Accessibility** (WCAG guidelines)
- **Dark mode** stöd

### Performance:
- **Lazy loading** för komponenter
- **Optimerad bildhantering**
- **Caching strategier**
- **Bundle optimization**
- **SEO-optimering**

### Säkerhet:
- **Input validation** och sanitization
- **XSS och CSRF** skydd
- **Rate limiting** för API-anrop
- **Säker fil-upload**
- **Session management**

## 📋 Implementationsordning

1. **🚨 Kritisk**: Fix Vercel build issue
2. **📱 Hög**: Mobile responsiveness och PWA
3. **💬 Hög**: Support chat system
4. **👤 Medium**: Account management och GDPR
5. **📨 Medium**: Enhanced messaging
6. **📊 Medium**: Customer dashboard

## 🛠️ Teknisk Stack

### Frontend:
- **React + TypeScript** med Vite
- **Tailwind CSS** för styling
- **Socket.IO Client** för real-time
- **React Hook Form** för formulär
- **React Query** för state management
- **PWA** med service worker

### Backend:
- **Node.js + Express** med TypeScript
- **PostgreSQL** med Prisma ORM
- **Socket.IO** för real-time messaging
- **JWT** för autentisering
- **Redis** för caching

### Deployment:
- **Vercel** för frontend hosting
- **Supabase** för databas
- **CDN** för statiska resurser

## 📝 Kvalitetskrav

### Testing:
- **Unit tests** för kritiska komponenter
- **Integration tests** för API endpoints
- **E2E tests** för viktiga användarflöden
- **Mobile testing** på olika enheter

### Code Quality:
- **TypeScript** strict mode
- **ESLint** och Prettier
- **Konsistent kodstil**
- **Dokumentation** av API endpoints
- **Error handling** och logging

## 🎯 Resultat och Mål

### Användarupplevelse:
- **App-liknande** mobil upplevelse
- **Intuitiv navigation** och interaktion
- **Snabb och responsiv** på alla enheter
- **Professionell design** som bygger förtroende

### Compliance:
- **GDPR-kompatibel** datahantering
- **Cookie-consent** enligt EU-regler
- **Data portability** och deletion rights
- **Transparent privacy** policies

### Business Value:
- **Ökad användarengagemang** via mobil
- **Bättre support** genom chat system
- **Förbättrad retention** med dashboard
- **Regelefterlevnad** minskar juridiska risker

---

**Viktigt**: Implementera funktioner stegvis med testing efter varje fas. Fokusera på användarupplevelse och prestanda genom hela processen.