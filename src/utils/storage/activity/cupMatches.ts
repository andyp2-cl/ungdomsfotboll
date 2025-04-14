
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "@/types/player";

/**
 * Update cup-match relationships in database
 * - När en match skapas inne från en cup, sätts matchens cupId till cupens id
 * - Detta skapar en tydlig one-to-many relation från cup till matcher
 */
export const updateCupMatches = async (activity: Activity, activities: Activity[]): Promise<void> => {
  try {
    // Om aktiviteten är en cup och har matcher...
    if (activity.type === 'cup') {
      console.log(`Processing cup ${activity.name} (${activity.id})`);
      
      // Hämta matcher som har denna cup som förälder
      const matchActivities = activities.filter(a => a.cupId === activity.id);
      console.log(`Found ${matchActivities.length} matches with cupId=${activity.id}`);
      
      // Säkerställ att cup-aktiviteten har en matches-array
      if (!activity.matches) {
        activity.matches = [];
      }
      
      // Uppdatera matches-array med IDs för alla matcher som har denna cup som förälder
      const matchIds = matchActivities.map(m => m.id);
      
      // Om det finns ändringar i matches-arrayen...
      const hasChanges = JSON.stringify(activity.matches.sort()) !== JSON.stringify(matchIds.sort());
      
      if (hasChanges) {
        console.log(`Updating cup ${activity.name} with ${matchIds.length} match IDs`);
        
        // Uppdatera cup-aktiviteten med den nya matches-arrayen
        activity.matches = matchIds;
        
        // Ensure player_stats exists
        if (!activity.player_stats) {
          activity.player_stats = {
            goals: {},
            assists: {}
          };
        }
        
        // Update cup_matches in player_stats for persistence
        activity.player_stats.cup_matches = matchIds;
        
        // Uppdatera cup-aktiviteten i databasen
        const { error: updateError } = await supabase
          .from('activities')
          .update({ 
            player_stats: activity.player_stats
          })
          .eq('id', activity.id);
          
        if (updateError) {
          console.error(`Error updating cup_matches for cup ${activity.name}:`, updateError);
          throw updateError;
        }
        
        console.log(`Updated cup ${activity.name} with ${matchIds.length} match IDs`);
        
        // Logga ändringen
        await logDatabaseChange(
          'update',
          'activity',
          activity.id,
          `Updated cup "${activity.name}" with ${matchIds.length} matches`
        );
      }
      
      // Se till att alla matcher har korrekt cupId
      for (const matchActivity of matchActivities) {
        if (matchActivity.cupId !== activity.id) {
          console.log(`Updating match ${matchActivity.name} with cupId=${activity.id}`);
          
          // Uppdatera matchaktiviteten i databasen
          const { error: updateError } = await supabase
            .from('activities')
            .update({ cup_id: activity.id })
            .eq('id', matchActivity.id);
            
          if (updateError) {
            console.error(`Error updating cupId for match ${matchActivity.name}:`, updateError);
            throw updateError;
          }
          
          console.log(`Updated cupId for match ${matchActivity.name}`);
          
          // Logga ändringen
          await logDatabaseChange(
            'update',
            'activity',
            matchActivity.id,
            `Connected match "${matchActivity.name}" to cup "${activity.name}"`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error updating cup-match relationships:", error);
    throw error;
  }
};

/**
 * Add new matches to a cup
 */
export const addCupMatches = async (
  cupActivity: Activity,
  newMatchActivities: Omit<Activity, 'id'>[],
  onActivityUpdate: (activity: Activity) => Promise<void>
): Promise<Activity[]> => {
  try {
    const createdMatches: Activity[] = [];
    
    // Ensure cupActivity has matches array
    if (!cupActivity.matches) {
      cupActivity.matches = [];
    }
    
    // Create each match activity
    for (const matchData of newMatchActivities) {
      // Create a new activity with uuid
      const newMatchActivity: Activity = {
        id: crypto.randomUUID(),
        ...matchData,
        participants: [], // Ensure participants array exists
      };
      
      console.log(`Creating match ${newMatchActivity.name} with cupId=${cupActivity.id}`);
      
      // Save the new match
      await onActivityUpdate(newMatchActivity);
      
      // Add to created matches list
      createdMatches.push(newMatchActivity);
      
      // Add match ID to cup's matches array
      cupActivity.matches.push(newMatchActivity.id);
    }
    
    // Update the cup with new matches array
    if (createdMatches.length > 0) {
      // Ensure player_stats exists
      if (!cupActivity.player_stats) {
        cupActivity.player_stats = {
          goals: {},
          assists: {}
        };
      }
      
      // Set cup_matches in player_stats for persistence
      cupActivity.player_stats.cup_matches = cupActivity.matches;
      
      // Update the cup activity
      await onActivityUpdate(cupActivity);
      
      console.log(`Updated cup ${cupActivity.name} with ${createdMatches.length} new matches`);
    }
    
    return createdMatches;
  } catch (error) {
    console.error("Error adding cup matches:", error);
    throw error;
  }
};
