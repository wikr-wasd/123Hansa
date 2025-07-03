# 📁 GitHub Uppladning för 123hansa.se

## Steg-för-Steg Guide (15 minuter)

### Steg 1: Skapa GitHub Repository (5 minuter)

#### 1.1 Gå till GitHub
1. Öppna [GitHub.com](https://github.com)
2. Klicka "Sign up" (om du inte har konto) eller "Sign in"
3. Skapa konto med användarnamn, e-post, lösenord

#### 1.2 Skapa Nytt Repository
1. Klicka "+" ikonen → "New repository"
2. Fyll i:
   - **Repository name**: `123hansa-marketplace`
   - **Description**: `123hansa.se - Sveriges Business Marketplace`
   - **Visibility**: 
     - ✅ **Public** (gratis Vercel deployment)
     - ❌ Private (kräver Vercel Pro)
   - **Initialize**: ❌ Kryssa INTE i någonting (du har redan kod)
3. Klicka "Create repository"

### Steg 2: Förbered Ditt Projekt (5 minuter)

#### 2.1 Öppna Terminal
```bash
# Navigera till ditt projekt
cd /home/willi/tubba-project

# Kolla att du är i rätt mapp
ls
# Du bör se: apps/, package.json, vercel.json, README.md
```

#### 2.2 Ta Bort Känsliga Filer (om de finns)
```bash
# Ta bort .env filer med riktiga lösenord (dessa ska ALDRIG till GitHub)
rm -f .env .env.local .env.production

# Ta bort databas filer
rm -f apps/api/prisma/dev.db*

# Ta bort log filer
rm -f *.log apps/api/server.log
```

### Steg 3: Ladda Upp till GitHub (5 minuter)

#### 3.1 Initiera Git (om inte redan gjort)
```bash
# Kolla om git redan är initialiserat
ls -la
# Om du ser .git mapp, hoppa över detta steg

# Om inte, initiera git:
git init
```

#### 3.2 Lägg Till Alla Filer
```bash
# Lägg till alla filer
git add .

# Skapa första commit
git commit -m "Initial commit: 123hansa.se marketplace production-ready

✨ Funktioner:
- Komplett ombranding till 123hansa.se
- Produktionsoptimerad för 1000+ användare
- Supabase + Vercel deployment redo
- Säkerhetshärdad
- Prestandaoptimerad
- Full svensk marketplace funktionalitet"
```

#### 3.3 Anslut till GitHub
```bash
# Lägg till GitHub repository som remote
# BYTA UT "DITT-ANVÄNDARNAMN" med ditt riktiga GitHub användarnamn
git remote add origin https://github.com/DITT-ANVÄNDARNAMN/123hansa-marketplace.git

# Sätt main branch
git branch -M main

# Ladda upp kod till GitHub
git push -u origin main
```

**Om du får autentiseringsfel:**
1. GitHub kan fråga efter användarnamn/lösenord
2. För lösenord, använd en "Personal Access Token" istället
3. Gå till GitHub → Settings → Developer settings → Personal access tokens → Generate new token

### Steg 4: Verifiera Uppladning

#### 4.1 Kolla på GitHub.com
1. Gå till: `https://github.com/DITT-ANVÄNDARNAMN/123hansa-marketplace`
2. Du ska se alla dina filer:
   - ✅ `apps/` mapp med api och web
   - ✅ `README.md`
   - ✅ `package.json`
   - ✅ `vercel.json`
   - ✅ Alla dokumentationsfiler

#### 4.2 Filstruktur Ska Se Ut Så Här:
```
123hansa-marketplace/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   ├── prisma/
│   │   └── package.json
│   └── web/
│       ├── src/
│       ├── index.html
│       └── package.json
├── .gitignore
├── .env.example
├── README.md
├── package.json
├── vercel.json
├── GITHUB_UPPLADNING.md
└── SUPABASE_VERCEL_DEPLOYMENT.md
```

## ✅ Vad Händer Nu?

### 1. Din Kod Är Säkert Lagrad
- ✅ All kod är backupad på GitHub
- ✅ Känsliga lösenord är INTE uppladade
- ✅ Versionshantering aktiverad

### 2. Redo för Vercel
- ✅ Vercel kan nu ansluta till ditt repository
- ✅ Automatiska deployments när du uppdaterar kod
- ✅ Optimerad konfiguration redan klar

### 3. Teamwork Möjlig
- ✅ Andra kan bidra till projektet
- ✅ Spåra alla ändringar
- ✅ Återgå till tidigare versioner om något går fel

## 🔄 Framtida Workflow

### När Du Gör Ändringar:
```bash
# 1. Gör dina ändringar i koden
# 2. Lägg till ändringarna
git add .

# 3. Commit med beskrivande meddelande
git commit -m "Lägg till ny funktion: affärslistfilter"

# 4. Ladda upp till GitHub
git push origin main
```

### Automatisk Deployment:
- Vercel upptäcker GitHub uppdatering
- Bygger om och deployr din sida automatiskt
- Tar 2-5 minuter för ändringar att bli live

## 🚨 Viktiga Säkerhetsregler

### ❌ Ladda ALDRIG Upp:
- `.env` filer med riktiga API nycklar
- Databas lösenord
- Stripe hemliga nycklar
- AWS credentials

### ✅ Säkert att Ladda Upp:
- `.env.example` (mall utan riktiga värden)
- All din källkod
- Konfigurationsfiler
- Dokumentation

## 🎯 Nästa Steg

### Efter GitHub Uppladning:
1. ✅ **GitHub klar** - Kod uppladdad och säker
2. 🔄 **Anslut till Vercel** - Följ SUPABASE_VERCEL_DEPLOYMENT.md
3. 🗄️ **Sätt upp Supabase** - Databas konfiguration
4. 🌐 **Konfigurera domän** - 123hansa.se setup

## 📞 Om Du Får Problem

### Vanliga Problem:
1. **"Permission denied"** → Använd Personal Access Token
2. **"Repository not found"** → Kolla användarnamn och repository namn
3. **"Files too large"** → Ta bort node_modules/ och .log filer

### Hjälp:
- GitHub dokumentation: [docs.github.com](https://docs.github.com)
- Git guide: [git-scm.com/doc](https://git-scm.com/doc)

---

**🎉 Grattis! Din 123hansa.se marketplace är nu på GitHub och redo för deployment! 🚀**

*Nästa steg: Följ SUPABASE_VERCEL_DEPLOYMENT.md för att deploya till produktion!*