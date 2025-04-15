
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "@/types/player";
import { formatActivityForDatabase } from "@/utils/database/formatters";
import { v4 as uuidv4 } from 'uuid';

/**
 * Update cup-match relationships in database
 */
export const updateCupMatches = async (activity: Activity, activities: Activity[]): Promise<void> => {
  try {
    // If the activity is a cup and has matches...
    if (activity.type === 'cup') {
      console.log(`Processing cup ${activity.name} (${activity.id})`);
      
      // Get matches that have this cup as parent
      const matchActivities = activities.filter(a => a.cupId === activity.id);
      console.log(`Found ${matchActivities.length} matches with cupId=${activity.id}`);
      
      // Ensure the cup activity has a matches array
      if (!activity.matches) {
        activity.matches = [];
      }
      
      // Update matches array with IDs of all matches that have this cup as parent
      const matchIds = matchActivities.map(m => m.id);
      
      // If there are changes in the matches array...
      const hasChanges = JSON.stringify(activity.matches.sort()) !== JSON.stringify(matchIds.sort());
      
      if (hasChanges) {
        console.log(`Updating cup ${activity.name} with ${matchIds.length} match IDs`);
        
        // Update cup activity with the new matches array
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
        
        // Update cup activity in database
        const { error: updateError } = await supabase
          .from('activities')
          .update({ 
            player_stats: activity.player_stats
          })
          .eq('id', activity.id);
          
        if (updateError) {
          console.error(`Error updating cup activity: ${updateError.message}`);
        }
      }
    }
  } catch (error) {
    console.error("Error updating cup-match relationships:", error);
  }
};

/**
 * Add new matches to a cup
 */
export const addCupMatches = async (
  cupActivity: Activity,
  newMatches: Omit<Activity, 'id'>[],
  updateActivity: (activity: Activity) => Promise<void>
): Promise<Activity[]> => {
  try {
    console.log(`Adding ${newMatches.length} matches to cup ${cupActivity.name}`);
    
    // Create full activities with IDs
    const matchActivities: Activity[] = newMatches.map(match => ({
      ...match,
      id: uuidv4(),
      // Make sure cupId is set
      cupId: cupActivity.id
    }));
    
    // Update the cup to add these matches
    const updatedCup = { ...cupActivity };
    
    // Initialize matches array if it doesn't exist
    if (!updatedCup.matches) {
      updatedCup.matches = [];
    }
    
    // Add new match IDs
    updatedCup.matches = [
      ...updatedCup.matches,
      ...matchActivities.map(m => m.id)
    ];
    
    // First update the cup to reference these new matches
    await updateActivity(updatedCup);
    
    // Then create each match activity
    for (const match of matchActivities) {
      // Save the activity to the database and state
      await updateActivity(match);
    }
    
    console.log(`Successfully added ${matchActivities.length} matches to cup ${cupActivity.name}`);
    return matchActivities;
    
  } catch (error) {
    console.error("Error adding cup matches:", error);
    throw error;
  }
};
