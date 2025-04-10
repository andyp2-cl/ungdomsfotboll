
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "./types";

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
