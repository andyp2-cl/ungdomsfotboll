import { supabase } from "../src/lib/supabase/client";
import { formatActivityForDatabase } from "../src/utils/database/formatters/activity";

async function migrateHomeAwayTeams() {
  console.log("Hämtar alla matcher...");
  const { data: matches, error } = await supabase
    .from("activities")
    .select("*")
    .eq("type", "match");

  if (error) {
    console.error("Fel vid hämtning av matcher:", error);
    return;
  }

  if (!matches) {
    console.log("Inga matcher hittades.");
    return;
  }

  let migrated = 0;
  let skipped = 0;
  let manual = 0;

  for (const match of matches) {
    if (match.home_team || match.away_team) {
      skipped++;
      continue;
    }
    if (typeof match.name === "string" && match.name.includes(" - ")) {
      const [home, away] = match.name.split(" - ").map(s => s.trim());
      if (home && away) {
        match.home_team = home;
        match.away_team = away;
        // Spara tillbaka
        const formatted = formatActivityForDatabase(match);
        const { error: upsertError } = await supabase
          .from("activities")
          .update({ home_team: home, away_team: away })
          .eq("id", match.id);
        if (upsertError) {
          console.error(`Fel vid uppdatering av match ${match.id}:`, upsertError);
        } else {
          migrated++;
          console.log(`Migrerat: ${match.name} → ${home} vs ${away}`);
        }
      } else {
        manual++;
        console.warn(`Kunde inte tolka: ${match.name}`);
      }
    } else {
      manual++;
      console.warn(`Kunde inte tolka: ${match.name}`);
    }
  }

  console.log(`\nMigrering klar!`);
  console.log(`Migrerade: ${migrated}`);
  console.log(`Redan ifyllda/skippade: ${skipped}`);
  console.log(`Behöver manuell hantering: ${manual}`);
}

migrateHomeAwayTeams().then(() => process.exit(0)); 