import { supabase } from '../src/integrations/supabase/client';

async function main() {
  const dryRun = true; // Sätt till false för att skriva till databasen
  const { data: activities, error } = await supabase
    .from('activities')
    .select('*')
    .eq('type', 'match');

  if (error) {
    console.error('Fel vid hämtning av aktiviteter:', error);
    process.exit(1);
  }

  if (!activities) {
    console.log('Inga matcher hittades.');
    return;
  }

  let updated = 0;
  let ambiguous: any[] = [];

  for (const activity of activities) {
    // Hoppa över om redan har homeTeam och awayTeam
    if (activity.home_team && activity.away_team) continue;
    if (!activity.name) continue;
    const parts = activity.name.split(' - ');
    if (parts.length === 2) {
      const homeTeam = parts[0].trim();
      const awayTeam = parts[1].trim();
      if (homeTeam && awayTeam) {
        console.log(`[UPDATERA] ${activity.id}: "${activity.name}" → Hemmalag: "${homeTeam}", Bortalag: "${awayTeam}"`);
        updated++;
        if (!dryRun) {
          await supabase
            .from('activities')
            .update({ home_team: homeTeam, away_team: awayTeam })
            .eq('id', activity.id);
        }
        continue;
      }
    }
    ambiguous.push(activity);
  }

  console.log(`\nTotalt möjliga att uppdatera: ${updated}`);
  if (ambiguous.length > 0) {
    console.log(`\nKunde inte tolka ${ambiguous.length} matcher:`);
    ambiguous.forEach(a => console.log(`- ${a.id}: "${a.name}"`));
  }
}

main().then(() => process.exit(0)); 