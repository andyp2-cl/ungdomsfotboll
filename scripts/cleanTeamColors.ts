import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zkrruihxszziifyogzko.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const COLORS = [
  "vit", "grön", "gul", "blå", "svart", "orange", "röd", "rosa", "lila", "marin",
  "turkos", "cyan", "brun", "beige", "silver", "guld", "mörkblå", "ljusblå", "mörkgrön", "ljusgrön"
];

function cleanTeamName(name: string | null): string | null {
  if (!name) return name;
  const colorPattern = COLORS.join("|");
  const cleaned = name.replace(new RegExp(`\\s+(${colorPattern})$`, "i"), "").trim();
  if (cleaned !== name) {
    console.log(`Cleaned team name: "${name}" → "${cleaned}"`);
  }
  return cleaned;
}

function cleanMatchName(name: string): string {
  const parts = name.split(" - ");
  if (parts.length === 2) {
    const cleanedHome = cleanTeamName(parts[0]);
    const cleanedAway = cleanTeamName(parts[1]);
    const cleanedName = `${cleanedHome} - ${cleanedAway}`;
    if (cleanedName !== name) {
      console.log(`Cleaned match name: "${name}" → "${cleanedName}"`);
    }
    return cleanedName;
  }
  return name;
}

async function cleanAllTeamNames() {
  console.log("Hämtar alla matcher...");
  const { data: matches, error } = await supabase
    .from("activities")
    .select("id, home_team, away_team, name")
    .eq("type", "match");

  if (error) {
    console.error("Fel vid hämtning av matcher:", error);
    return;
  }
  if (!matches) {
    console.log("Inga matcher hittades.");
    return;
  }

  console.log(`Hittade ${matches.length} matcher.`);

  let updated = 0;
  for (const match of matches) {
    console.log(`\nProcessing match: ${match.name}`);
    console.log(`Current teams: home="${match.home_team}", away="${match.away_team}"`);

    const cleanedName = cleanMatchName(match.name);
    
    if (cleanedName !== match.name) {
      console.log(`Updating match name to: "${cleanedName}"`);
      const { error: updateError } = await supabase
        .from("activities")
        .update({
          name: cleanedName
        })
        .eq("id", match.id);
        
      if (updateError) {
        console.error(`Fel vid uppdatering av match ${match.id}:`, updateError);
      } else {
        updated++;
        console.log(`Uppdaterade: ${match.name} → ${cleanedName}`);
      }
    } else {
      console.log("No changes needed for this match.");
    }
  }
  console.log(`\nFärdigt! Uppdaterade ${updated} matcher.`);
}

cleanAllTeamNames().then(() => process.exit(0)); 