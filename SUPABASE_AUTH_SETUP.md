# Supabase Auth Setup Guide

## 1. Supabase Dashboard Inställningar

### Authentication → URL Configuration

#### Site URL
Sätt din huvuddomän:
- **Utveckling:** `http://localhost:8080` (eller vilken port du använder)
- **Produktion:** `https://hassleholmsifp2014.lovable.app`

#### Redirect URLs
Lägg till alla dessa URL:er:
```
http://localhost:3000/reset-password
http://localhost:5173/reset-password
http://localhost:8080/reset-password
https://hassleholmsifp2014.lovable.app/reset-password
```

### Authentication → Settings

#### Email Auth
- ✅ Enable email confirmations: **AV** (för enklare utveckling)
- ✅ Enable email change confirmations: **AV**
- ✅ Enable secure email change: **PÅ**

#### Password Requirements
- Minimum password length: **6**
- Password strength: **Weak** (för utveckling, höj senare)

## 2. Funktionalitet som nu finns

### ✅ Registrering
- Nya användare kan registrera sig med email/lösenord
- Validering av lösenordsstyrka och matchning
- Automatisk växling till inloggning efter registrering

### ✅ Inloggning
- Email/lösenord inloggning
- Felhantering för fel uppgifter

### ✅ Glömt lösenord
- Skicka återställningsmail
- Automatisk redirect till rätt URL oavsett port
- Hantering av både query params och hash fragments

### ✅ Återställ lösenord
- Säker token-verifiering
- Lösenordsvalidering
- Automatisk utloggning efter återställning

## 3. Testning

### Registrera ny användare
1. Gå till din app
2. Klicka på "Registrera"-fliken
3. Fyll i email och lösenord
4. Klicka "Registrera konto"
5. Du bör få meddelande om lyckad registrering

### Testa glömt lösenord
1. Klicka "Glömt lösenord?"
2. Ange din email
3. Kolla din inkorg
4. Klicka på länken i mailet
5. Sätt nytt lösenord

## 4. Felsökning

### "Invalid API key"
- Kontrollera att `.env` filen är korrekt formaterad (inte RTF)
- Starta om dev-servern efter ändringar i `.env`

### "Ogiltig återställningslänk"
- Kontrollera att redirect URL:erna är korrekt inställda i Supabase
- Se till att du använder hela länken från mailet

### Mailet kommer inte fram
- Kolla spam/skräppost
- Kontrollera att email-adressen är korrekt
- Vänta upp till 5 minuter (Supabase kan vara långsam)

## 5. Säkerhet för produktion

### Före lansering:
- [ ] Höj password strength till "Strong"
- [ ] Aktivera email confirmations
- [ ] Sätt korrekt Site URL för produktion
- [ ] Ta bort localhost URLs från Redirect URLs
- [ ] Implementera Row Level Security (RLS)
- [ ] Skapa users tabell med roller 