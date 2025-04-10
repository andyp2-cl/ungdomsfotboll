
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity, PlayerStats } from "@/types/player";

/**
 * Update cup-match relationships in database
 * - När en match skapas inne från en cup, sätts matchens cup_id till cupens id
 * - Detta skapar en tydlig one-to-many relation från cup till matcher
 */
export const updateCupMatches = async (activity: Activity, activities: Activity[]): Promise<void> => {
  try {
    // Om aktiviteten är en cup och har matcher...
    if (activity.type === 'cup' && activity.matches && activity.matches.length > 0) {
      console.log(`Cup ${activity.name} har ${activity.matches.length} matcher, uppdaterar deras cupId`);
      
      // Ensure player_stats exists and initialize cup_matches array if needed
      if (!activity.player_stats) {
        activity.player_stats = {
          goals: {},
          assists: {},
          cup_matches: []
        };
      }
      
      if (!activity.player_stats.cup_matches) {
        activity.player_stats.cup_matches = [];
      }
      
      // Store match IDs in player_stats.cup_matches for persistence
      activity.player_stats.cup_matches = activity.matches;
      
      // Hämta matchaktiviteterna
      const matchActivities = activities.filter(a => activity.matches?.includes(a.id));
      console.log(`Hittade ${matchActivities.length} matchaktiviteter för cup ${activity.name}:`, 
        matchActivities.map(m => ({id: m.id, name: m.name})));
      
      // Uppdatera varje match med cup-ID
      for (const matchActivity of matchActivities) {
        console.log(`Uppdaterar match ${matchActivity.name} med cupId ${activity.id}`);
        
        // Uppdatera matchen i databasen med cupId
        const { error: updateError } = await supabase
          .from('activities')
          .update({ cup_id: activity.id })
          .eq('id', matchActivity.id);
          
        if (updateError) {
          console.error(`Fel vid uppdatering av cupId för match ${matchActivity.name}:`, updateError);
        } else {
          console.log(`Uppdaterade cupId för match ${matchActivity.name}`);
          
          // Logga cup-kopplingen
          await logDatabaseChange(
            'update',
            'activity',
            matchActivity.id,
            `Kopplade match "${matchActivity.name}" till cup "${activity.name}"`
          );
        }
      }
      
      // Uppdatera cups player_stats med cup_matches array
      const { error: updateCupError } = await supabase
        .from('activities')
        .update({ 
          player_stats: activity.player_stats as any // Use type assertion to avoid incompatibility
        })
        .eq('id', activity.id);
        
      if (updateCupError) {
        console.error(`Fel vid uppdatering av cup_matches för cup ${activity.name}:`, updateCupError);
      } else {
        console.log(`Uppdaterade cup_matches för cup ${activity.name}:`, activity.player_stats.cup_matches);
      }
      
      // Logga alla cup-matchrelationer
      await logDatabaseChange(
        'update',
        'activity',
        activity.id,
        `Kopplade ${activity.matches.length} matcher till cup "${activity.name}"`
      );
    }
  } catch (error) {
    console.error("Fel vid uppdatering av cup-matcher:", error);
  }
};
