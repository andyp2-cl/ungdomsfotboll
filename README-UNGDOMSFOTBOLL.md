# Ungdomsfotboll - Multi-Tenant Plattform

En multi-tenant version av Hässleholms IF P2014-appen där flera lag kan använda samma plattform med isolerad data och egen branding.

## 🚀 Snabbstart

### 1. Installera dependencies
```bash
npm install
```

### 2. Konfigurera Supabase
Projektet använder det nya Supabase-projektet: `maoxicjfknzbmthfimwl`

### 3. Applicera databas-migrationer
```bash
# Kör migrationerna i ordning:
supabase db push
```

### 4. Starta utvecklingsservern
```bash
npm run dev
```

## 📋 Funktioner

### För Tränare
- ✅ Registrera nytt lag med namn och färger
- ✅ Vänta på admin-godkännande
- ✅ Hantera spelare och aktiviteter (efter godkännande)
- ✅ Se bara data från sitt eget lag

### För Admin
- ✅ Se alla lag med status
- ✅ Godkänna/avvisa nya lag
- ✅ Ta bort lag
- ✅ Se statistik över alla lag

## 🗄️ Databas-struktur

### Nya tabeller
- `teams` - Lag-information och branding
- `user_profiles` - Utökad användarprofil med team-koppling

### Uppdaterade tabeller
Alla befintliga tabeller har fått en `team_id` kolumn för multi-tenant isolering:
- `players`
- `activities`
- `player_activities`
- `player_development_history`
- `player_ratings`
- `training_stats`
- `training_uploads`
- `leagues`
- `app_settings`

## 🔐 Säkerhet

### Row Level Security (RLS)
Alla tabeller har RLS aktiverat med policies som säkerställer:
- Användare ser bara data från sitt eget lag
- Admin kan se all data från alla lag
- Automatisk filtrering baserat på `team_id`

### Roller
- `admin` - Superadmin, kan hantera alla lag
- `coach` - Lagägare, kan bara hantera sitt eget lag

## 🎨 Branding

Varje lag kan anpassa:
- Primär färg (hex-format)
- Sekundär färg (hex-format)
- Logotyp (kommer snart)

## 🛣️ Routes

- `/team-registration` - Registrera nytt lag
- `/admin` - Admin panel (endast för admin)
- `/players` - Huvudapp (efter inloggning)

## 🔧 Utveckling

### Nya komponenter
- `TeamRegistrationForm` - Formulär för lag-registrering
- `TeamApprovalList` - Admin-komponent för team-hantering
- `AdminPage` - Admin-sida

### Nya hooks
- `useTeam` - Team-hantering och data
- `useAdmin` - Admin-funktioner

### Nya typer
- `Team` - Team-interface
- `UserProfile` - Utökad användarprofil
- `CreateTeamData` - Data för att skapa lag

## 📝 Nästa steg

1. **Testa registrering** - Gå till `/team-registration`
2. **Testa admin** - Gå till `/admin` (behöver admin-roll)
3. **Implementera team-branding** - Dynamisk styling baserat på lagets färger
4. **Lägg till logotyp-uppladdning** - Supabase Storage integration
5. **E-postflöden** - Automatiska e-post vid godkännande/avvisning
6. **Team-isolering** - Säkerställ att all data filtreras korrekt

## 🐛 Felsökning

### Vanliga problem

1. **TypeScript-fel** - Kör `npm run build` för att se alla fel
2. **RLS-policies** - Kontrollera att användaren har rätt `team_id`
3. **Migrationer** - Kör `supabase db reset` för att börja om från början

### Loggar
Kolla browser-konsolen för fel och Supabase-dashboard för databas-fel.

## 📞 Support

För frågor eller problem, kontakta utvecklingsteamet. 