# 123Hansa Messaging & Notification System Setup Guide

## Översikt
Detta är den kompletta guiden för att sätta upp 123Hansas messaging och notification system (Session 6).

## Vad som implementerats

### 1. Backend (API)

#### Databas Schema
- ✅ Utökad Prisma schema med avancerade messaging funktioner
- ✅ Conversation modell för organisering av meddelanden
- ✅ Message modell med encryption och filstöd
- ✅ MessageAttachment för fildelning
- ✅ TypingIndicator för real-time typing
- ✅ Notification system med preferences
- ✅ NotificationSettings för användarinställningar
- ✅ EmailTemplate för flerspråkiga e-postmallar

#### Services
- ✅ **SocketService** - Komplett real-time messaging med Socket.IO
- ✅ **MessageService** - CRUD operationer, sökning, encryption
- ✅ **NotificationService** - In-app och e-post notifikationer
- ✅ **EmailService** - Svenska e-postmallar för alla funktioner

#### API Endpoints
- ✅ `/api/messages/conversations` - Konversationshantering
- ✅ `/api/messages/messages` - Meddelandehantering
- ✅ `/api/messages/notifications` - Notifikationshantering
- ✅ `/api/messages/notification-settings` - Användarinställningar
- ✅ Rate limiting och säkerhetsmiddleware

### 2. Frontend (Web)

#### Services
- ✅ **messageService** - API klient för meddelanden
- ✅ **socketService** - WebSocket hantering för real-time

#### Komponenter
- ✅ **ChatInterface** - Huvudkomponent för hela chat-systemet
- ✅ **ConversationsList** - Lista med alla konversationer
- ✅ **MessagesList** - Visa meddelanden i en konversation
- ✅ **MessageInput** - Skicka meddelanden och filer
- ✅ **NotificationPanel** - Hantera notifikationer
- ✅ **NotificationSettingsPage** - Användarinställningar

#### Pages
- ✅ **MessagesPage** - Komplett meddelande-interface
- ✅ **NotificationSettingsPage** - Inställningar för notifikationer

## Installation & Setup

### 1. Miljövariabler
Lägg till i `.env`:
```bash
# Message Encryption (generera en säker nyckel)
MESSAGE_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Email för MailHog utveckling
SMTP_HOST=localhost
SMTP_PORT=1025

# För produktion - konfigurera riktig e-postserver
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=your-sendgrid-api-key
```

### 2. Databas Migration
```bash
cd apps/api

# För utveckling med SQLite
DATABASE_URL="file:./dev.db" npx prisma migrate dev --name add-messaging-system

# För PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/tubba" npx prisma migrate dev --name add-messaging-system

# Generera Prisma client
npx prisma generate
```

### 3. Starta servrar

#### Backend (Terminal 1)
```bash
cd apps/api
npm run dev
```

#### Frontend (Terminal 2)
```bash
cd apps/web
npm run dev
```

#### MailHog för e-post testing (Terminal 3)
```bash
# Installera MailHog
brew install mailhog  # macOS
# eller
go install github.com/mailhog/MailHog@latest  # Go

# Starta MailHog
mailhog
# Öppna http://localhost:8025 för att se e-post
```

### 4. Frontend Dependencies
Lägg till i `apps/web/package.json`:
```json
{
  "dependencies": {
    "socket.io-client": "^4.7.4",
    "date-fns": "^2.30.0"
  }
}
```

```bash
cd apps/web
npm install
```

## Funktioner & Säkerhet

### ✅ Implementerade Funktioner

#### Real-time Messaging
- ✅ WebSocket-baserad real-time kommunikation
- ✅ Konversationshantering med topics (listings)
- ✅ Typing indicators
- ✅ Message read receipts
- ✅ Online/offline status
- ✅ File sharing med validering

#### Message Encryption
- ✅ AES-256 encryption för känsliga meddelanden
- ✅ Automatisk encryption för INQUIRY meddelanden
- ✅ Säker nyckelhantering

#### Notification System
- ✅ In-app notifikationer
- ✅ E-post notifikationer med svenska mallar
- ✅ Användarkonfigurerbara inställningar
- ✅ Quiet hours funktionalitet
- ✅ GDPR-kompatibel datarensning

#### Security Features
- ✅ JWT-baserad WebSocket autentisering
- ✅ Rate limiting för alla endpoints
- ✅ Input sanitization mot XSS
- ✅ Message moderation capabilities
- ✅ User blocking/archiving

#### Nordic Specifika Features
- ✅ Svenska språkstöd i hela systemet
- ✅ Nordic email templates
- ✅ Local time formatting för Stockholm
- ✅ Compliance med Nordic messaging regler

## API Endpoints

### Conversations
```
POST   /api/messages/conversations              # Skapa konversation
GET    /api/messages/conversations              # Hämta användarens konversationer
GET    /api/messages/conversations/:id/messages # Hämta meddelanden
PUT    /api/messages/conversations/:id/read     # Markera som läst
PUT    /api/messages/conversations/:id/block    # Blockera/avblockera
PUT    /api/messages/conversations/:id/archive  # Arkivera
POST   /api/messages/conversations/:id/messages/search # Sök meddelanden
```

### Messages
```
POST   /api/messages/messages                   # Skicka meddelande
PUT    /api/messages/messages/:id/read          # Markera som läst
DELETE /api/messages/messages/:id               # Ta bort meddelande
POST   /api/messages/messages/:id/attachments   # Ladda upp bilaga
GET    /api/messages/unread-count               # Antal olästa
```

### Notifications
```
GET    /api/messages/notifications              # Hämta notifikationer
PUT    /api/messages/notifications/:id/read     # Markera som läst
PUT    /api/messages/notifications/read-all     # Markera alla som lästa
DELETE /api/messages/notifications/:id          # Ta bort notifikation
GET    /api/messages/notifications/unread-count # Antal olästa
```

### Settings
```
GET    /api/messages/notification-settings      # Hämta inställningar
PUT    /api/messages/notification-settings      # Uppdatera inställningar
```

## WebSocket Events

### Client → Server
```javascript
// Conversation management
socket.emit('join_conversation', { conversationId })
socket.emit('leave_conversation', { conversationId })

// Messaging
socket.emit('send_message', { conversationId, content, type, metadata })
socket.emit('mark_message_read', { messageId })
socket.emit('delete_message', { messageId })

// Typing indicators
socket.emit('start_typing', { conversationId })
socket.emit('stop_typing', { conversationId })

// Notifications
socket.emit('mark_notification_read', { notificationId })
socket.emit('get_unread_count')
```

### Server → Client
```javascript
// Messages
socket.on('new_message', (message) => {})
socket.on('message_read', ({ messageId, conversationId, readBy }) => {})
socket.on('message_deleted', ({ messageId, conversationId }) => {})

// Typing
socket.on('user_typing', ({ userId, conversationId, isTyping }) => {})

// Notifications
socket.on('new_notification', ({ type, conversationId, message }) => {})
socket.on('notification', (notification) => {})

// User status
socket.on('user_status_change', ({ userId, isOnline, timestamp }) => {})
socket.on('unread_count', ({ count }) => {})
```

## Testing

### 1. Manual Testing
1. Öppna två webbläsare/tabs med olika användare
2. Gå till `/messages` på båda
3. Testa skicka meddelanden real-time
4. Testa file uploads
5. Testa notifikationer i `/notification-settings`
6. Kolla e-post i MailHog (http://localhost:8025)

### 2. Database Check
```bash
cd apps/api
npx prisma studio
# Öppna http://localhost:5555 för att se data
```

### 3. Socket Connection Test
```javascript
// I browser console
const socket = io('http://localhost:3001', {
  auth: { token: localStorage.getItem('accessToken') }
});
socket.on('connect', () => console.log('Connected!'));
```

## Troubleshooting

### Common Issues

1. **Socket connection fails**
   - Kontrollera att API servern körs på port 3001
   - Kolla att accessToken finns i localStorage
   - Se browser console för fel

2. **E-post skickas inte**
   - Kontrollera att MailHog körs på port 1025
   - Kolla API logs för e-post fel

3. **Database errors**
   - Kör `npx prisma migrate reset` för att återställa
   - Kontrollera DATABASE_URL i .env

4. **Real-time inte fungerar**
   - Kontrollera CORS inställningar i backend
   - Se om WebSocket connection är blockerad

## Production Deployment

### Säkerhet
1. Ändra MESSAGE_ENCRYPTION_KEY till en säker 32-character nyckel
2. Konfigurera riktig SMTP server (SendGrid, Mailgun, etc.)
3. Sätt upp SSL/TLS för WebSocket connections
4. Konfigurera rate limiting per miljö

### Prestanda
1. Implementera Redis för Socket.IO clustering
2. Sätt upp CDN för file uploads
3. Optimera databas-index för meddelande-queries
4. Implementera message archiving för gamla konversationer

## Nästa Steg

✅ **SESSION 6 KOMPLETT** - Messaging & Notification System

**Nästa steg är Payment Integration (Session 7)** enligt utvecklingsplanen:
- Stripe integration för Nordiska marknaden
- Swish, MobilePay, Vipps stöd
- Escrow system för säkra transaktioner
- Commission hantering