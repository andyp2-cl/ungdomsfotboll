# Ungdomsfotboll - Multi-Tenant Projektplan

## Översikt
Bygga en multi-tenant version av Hässleholms IF P2014-appen för att flera lag kan använda samma plattform. Varje lag har isolerad data och egen branding.

## Teknisk Stack
- **Frontend:** React + TypeScript + Vite + Shadcn/ui
- **Backend:** Supabase (Auth, Database, Storage)
- **Nytt Supabase-projekt:** maoxicjfknzbmthfimwl (ungdomsfotboll)

## 1. Databasdesign & Multi-Tenant Struktur

### Huvudtabeller

#### teams
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#1E40AF',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### users (utökad profil)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  role VARCHAR(20) DEFAULT 'coach', -- 'admin', 'coach'
  full_name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Befintliga tabeller (med team_id)
Alla befintliga tabeller får en `team_id` kolumn:
- players
- activities/matches
- player_stats
- cups
- etc.

```sql
-- Exempel för players
ALTER TABLE players ADD COLUMN team_id UUID REFERENCES teams(id);
```

### Row Level Security (RLS)
```sql
-- Aktivera RLS på alla tabeller
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- ... för alla andra tabeller

-- Policies för teams
CREATE POLICY "Users can view their own team" ON teams
  FOR SELECT USING (id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all teams" ON teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies för players
CREATE POLICY "Users can view players in their team" ON players
  FOR SELECT USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can modify players in their team" ON players
  FOR ALL USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));
```

## 2. Registrerings- & Onboarding-flöde

### Registreringsformulär
- E-post och lösenord (Supabase Auth)
- Lagnamn (obligatoriskt)
- Logotyp (valfritt, laddas upp till Supabase Storage)
- Primär och sekundär färg (color picker)
- Telefonnummer (valfritt)

### Status-hantering
- **pending:** Lag skapat men väntar på admin-godkännande
- **approved:** Lag godkänt, tränare kan logga in
- **rejected:** Lag avvisat (med anledning)

### E-postflöden
1. **Vid registrering:** "Tack för din ansökan. Vi kommer att granska den inom 24h."
2. **Vid godkännande:** "Ditt lag har godkänts! Du kan nu logga in."
3. **Vid avvisning:** "Tyvärr kunde vi inte godkänna ditt lag. Anledning: [anledning]"

## 3. Autentisering & Roller

### Roller
- **admin:** Du (superadmin), kan se och hantera alla lag
- **coach:** Lagägare, kan bara se och hantera sitt eget lag

### Åtkomstkontroll
- Alla queries filtreras automatiskt på `team_id`
- Admin kan se all data från alla lag
- Coach ser bara data från sitt eget lag

## 4. Adminpanel

### Funktioner
- **Översikt:** Lista alla lag med status, tränare, antal spelare
- **Godkännande:** Godkänn/avvisa nya lag med kommentar
- **Hantering:** Redigera laginfo, logotyp, färger
- **Användare:** Se alla användare och deras roller
- **Statistik:** Övergripande statistik över alla lag

### UI-komponenter
- AdminDashboard.tsx
- TeamApprovalList.tsx
- TeamManagement.tsx
- UserManagement.tsx

## 5. Branding & UI-anpassning

### Context/Provider
```typescript
interface TeamContext {
  team: Team | null;
  colors: {
    primary: string;
    secondary: string;
  };
  logo: string | null;
}
```

### Dynamisk styling
- Header-färger baserat på lagets primärfärg
- Knappar och UI-element anpassas efter lagets färgschema
- Logotyp visas i header och på relevanta ställen

## 6. Kodstruktur

### Nya komponenter
```
src/
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── TeamApprovalList.tsx
│   │   ├── TeamManagement.tsx
│   │   └── UserManagement.tsx
│   ├── auth/
│   │   ├── TeamRegistrationForm.tsx
│   │   └── TeamSetupWizard.tsx
│   └── team/
│       ├── TeamBranding.tsx
│       └── TeamSelector.tsx
├── hooks/
│   ├── useTeam.ts
│   ├── useTeamAuth.ts
│   └── useAdmin.ts
├── types/
│   ├── team.ts
│   └── user.ts
└── utils/
    ├── teamUtils.ts
    └── brandingUtils.ts
```

### Hooks
```typescript
// useTeam.ts - Hämta aktuellt lag och dess data
// useTeamAuth.ts - Hantera team-specifik autentisering
// useAdmin.ts - Admin-funktioner (endast för admin)
```

## 7. Migrering från gamla projektet

### Alternativ 1: Från början (rekommenderat)
- Skapa alla tabeller på nytt
- Börja med tom data
- Testa med dummydata

### Alternativ 2: Migrera data
```bash
# Exportera från gamla Supabase
supabase db dump --data-only > old_data.sql

# Importera i nya projektet
supabase db reset
psql -h [host] -U [user] -d [db] -f old_data.sql

# Lägg till team_id på alla rader
UPDATE players SET team_id = (SELECT id FROM teams WHERE name = 'Hässleholms IF P2014');
```

## 8. Implementation-steg

### Fas 1: Grundläggande setup
1. Skapa nya Supabase-projektet
2. Skapa tabeller (teams, user_profiles)
3. Sätta upp RLS-policies
4. Uppdatera befintliga tabeller med team_id

### Fas 2: Autentisering & registrering
1. Bygg registreringsformulär med team-info
2. Implementera status-hantering
3. Sätta upp e-postflöden
4. Testa registreringsflödet

### Fas 3: Adminpanel
1. Bygg admin-dashboard
2. Implementera team-godkännande
3. Bygg team-hantering
4. Testa admin-funktioner

### Fas 4: UI & branding
1. Implementera team-context
2. Bygg dynamisk styling
3. Anpassa alla komponenter för team-branding
4. Testa med olika lag

### Fas 5: Testning & lansering
1. Omfattande testning
2. Bugfixar
3. Lansering

## 9. Miljövariabler

### .env
```env
VITE_SUPABASE_URL=https://maoxicjfknzbmthfimwl.supabase.co
VITE_SUPABASE_ANON_KEY=[din_nya_anon_key]
```

## 10. Säkerhet

### RLS-policies
- Alla tabeller har RLS aktiverat
- Policies säkerställer att användare bara ser sin egen data
- Admin kan se all data

### Validering
- Server-side validering av alla inputs
- XSS-skydd
- CSRF-skydd (Supabase hanterar detta)

## 11. Prestanda

### Optimeringar
- Index på team_id för snabba queries
- Caching av team-data
- Lazy loading av komponenter
- Optimized images för logotyper

## 12. Framtida utbyggnad

### Möjliga tillägg
- Flera tränare per lag
- Lag-inbjudningar
- Betalningsintegration
- GDPR/export-funktioner
- API för externa integrationer

## 13. Testning

### Test-scenarier
1. **Registrering:** Ny tränare registrerar lag
2. **Godkännande:** Admin godkänner lag
3. **Inloggning:** Tränare loggar in och ser bara sitt lag
4. **Admin:** Admin kan se och hantera alla lag
5. **Branding:** UI anpassas efter lagets färger
6. **Data-isolering:** Lag kan inte se varandras data

## 14. Deployment

### Vercel/Netlify
- Sätt upp nya miljövariabler
- Konfigurera build-settings
- Testa i staging-miljö

### Supabase
- Sätta upp production-databas
- Konfigurera e-post-inställningar
- Sätta upp backup-strategi

---

## Snabbstart-kommandon

```bash
# Skapa ny branch
git checkout -b ungdomsfotboll

# Installera dependencies (om nytt projekt)
npm install

# Starta utvecklingsserver
npm run dev

# Skapa Supabase-migrationer
supabase migration new create_teams_table
supabase migration new create_user_profiles_table
supabase migration new add_team_id_to_existing_tables

# Applicera migrationer
supabase db push
```

## Viktiga filer att skapa/modifiera

1. `src/types/team.ts` - Team-typer
2. `src/hooks/useTeam.ts` - Team-hook
3. `src/components/admin/` - Admin-komponenter
4. `src/components/auth/TeamRegistrationForm.tsx` - Registrering
5. `supabase/migrations/` - Databas-migrationer
6. `.env` - Nya miljövariabler

---

**Nästa steg:** Börja med att skapa databas-tabellerna och sätta upp grundläggande RLS-policies. 