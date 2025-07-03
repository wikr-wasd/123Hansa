# 🚀 Snabba Deployment Kommandon för 123hansa.se

## Steg 1: Förbered GitHub Uppladning (2 minuter)

```bash
# Navigera till ditt projekt
cd /home/willi/tubba-project

# Kolla att .gitignore finns
ls -la .gitignore

# Ta bort känsliga filer (om de finns)
rm -f .env .env.local .env.production apps/api/prisma/dev.db* *.log

# Initiera git (om inte redan gjort)
git init

# Lägg till alla filer
git add .

# Skapa commit
git commit -m "123hansa.se marketplace - produktionsredo"
```

## Steg 2: Anslut till GitHub

```bash
# Lägg till remote (byt ut DITT-ANVÄNDARNAMN)
git remote add origin https://github.com/DITT-ANVÄNDARNAMN/123hansa-marketplace.git

# Sätt main branch
git branch -M main

# Ladda upp
git push -u origin main
```

## Steg 3: Framtida Uppdateringar

```bash
# När du gör ändringar:
git add .
git commit -m "Beskrivning av ändring"
git push origin main
```

## 📋 Checklista Innan GitHub

- [ ] .gitignore fil finns
- [ ] .env.example fil finns (utan riktiga lösenord)
- [ ] Inga .env filer med riktiga lösenord
- [ ] Inga databasfiler (*.db)
- [ ] Inga log filer
- [ ] README.md uppdaterad

## 🎯 Efter GitHub Uppladning

1. ✅ Gå till GitHub.com och verifiera att allt finns
2. 🔄 Följ SUPABASE_VERCEL_DEPLOYMENT.md
3. 🌐 Konfigurera 123hansa.se domän
4. 🎉 Din marknadsplats är live!

---

**Nästa: Öppna GITHUB_UPPLADNING.md för detaljerade instruktioner**