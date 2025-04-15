
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
      
      // Get both explicit matches (in matches array) and implicit matches (with cupId)
      const explicitMatches = activity.matches || [];
      const implicitMatches = activities
        .filter(a => a.cupId === activity.id)
        .map(a => a.id);
      
      // Combine all match IDs (remove duplicates)
      const allMatchIds = [...new Set([...explicitMatches, ...implicitMatches])];
      
      console.log(`Found ${allMatchIds.length} total matches for cup ${activity.id}`);
      
      // Update the cup activity with all match IDs
      if (allMatchIds.length > 0) {
        // Ensure the cup has an updated matches array
        activity.matches = allMatchIds;
        
        // Ensure player_stats exists
        if (!activity.player_stats) {
          activity.player_stats = {
            goals: {},
            assists: {}
          };
        }
        
        // Update cup_matches in player_stats for persistence
        activity.player_stats.cup_matches = allMatchIds;
        
        // Update cup activity in database
        const { error: updateError } = await supabase
          .from('activities')
          .update({ 
            matches: allMatchIds, 
            player_stats: activity.player_stats
          })
          .eq('id', activity.id);
          
        if (updateError) {
          console.error(`Error updating cup activity: ${updateError.message}`);
        } else {
          console.log(`Successfully updated cup ${activity.id} with ${allMatchIds.length} matches`);
        }
      }
    }
    
    // If the activity is a match with a cupId, ensure it's in the cup's matches array
    if (activity.cupId) {
      const parentCup = activities.find(a => a.id === activity.cupId);
      
      if (parentCup && parentCup.type === 'cup') {
        if (!parentCup.matches) {
          parentCup.matches = [];
        }
        
        if (!parentCup.matches.includes(activity.id)) {
          console.log(`Adding match ${activity.id} to cup ${parentCup.id}`);
          parentCup.matches.push(activity.id);
          
          // Update parent cup in database
          if (!parentCup.player_stats) {
            parentCup.player_stats = {
              goals: {},
              assists: {}
            };
          }
          
          parentCup.player_stats.cup_matches = parentCup.matches;
          
          const { error: updateError } = await supabase
            .from('activities')
            .update({ 
              matches: parentCup.matches, 
              player_stats: parentCup.player_stats 
            })
            .eq('id', parentCup.id);
            
          if (updateError) {
            console.error(`Error updating parent cup: ${updateError.message}`);
          }
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
    
    console.log(`Updating cup with match IDs:`, updatedCup.matches);
    
    // First update the cup to reference these new matches
    await updateActivity(updatedCup);
    
    // Then create each match activity
    for (const match of matchActivities) {
      console.log(`Creating match ${match.id}: ${match.name}`);
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
