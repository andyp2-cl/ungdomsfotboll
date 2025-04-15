
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
    console.log("updateCupMatches called for activity:", activity.id, activity.name, activity.type);
    
    // If the activity is a cup and has matches...
    if (activity.type === 'cup') {
      console.log(`Processing cup ${activity.name} (${activity.id})`);
      
      // Get both explicit matches (in matches array) and implicit matches (with cupId)
      const explicitMatches = activity.matches || [];
      const implicitMatches = activities
        .filter(a => a.cupId === activity.id && a.type === 'match')
        .map(a => a.id);
      
      // Combine all match IDs (remove duplicates)
      const allMatchIds = [...new Set([...explicitMatches, ...implicitMatches])];
      
      console.log(`Found ${allMatchIds.length} total matches for cup ${activity.id}:`, allMatchIds);
      
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
            player_stats: activity.player_stats,
            type: activity.type
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
      console.log(`Processing match ${activity.name} (${activity.id}) with cupId: ${activity.cupId}`);
      
      const parentCup = activities.find(a => a.id === activity.cupId);
      
      if (parentCup && parentCup.type === 'cup') {
        if (!parentCup.matches) {
          parentCup.matches = [];
        }
        
        if (!parentCup.matches.includes(activity.id)) {
          console.log(`Adding match ${activity.id} to cup ${parentCup.id}`);
          
          const updatedCup = { ...parentCup };
          updatedCup.matches = [...updatedCup.matches, activity.id];
          
          // Update parent cup in database
          if (!updatedCup.player_stats) {
            updatedCup.player_stats = {
              goals: {},
              assists: {}
            };
          }
          
          updatedCup.player_stats.cup_matches = updatedCup.matches;
          
          console.log("Updating parent cup with match ID:", updatedCup.matches);
          
          const { error: updateError } = await supabase
            .from('activities')
            .update({ 
              matches: updatedCup.matches, 
              player_stats: updatedCup.player_stats 
            })
            .eq('id', updatedCup.id);
            
          if (updateError) {
            console.error(`Error updating parent cup: ${updateError.message}`);
          } else {
            console.log(`Successfully updated parent cup with match ID ${activity.id}`);
          }
        } else {
          console.log(`Match ${activity.id} already in cup ${parentCup.id}'s matches array`);
        }
      } else {
        console.error(`Failed to find parent cup with ID ${activity.cupId} for match ${activity.id}`);
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
      cupId: cupActivity.id,
      // Ensure matches is initialized as empty array
      matches: []
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
    console.log("Updated cup with match references successfully");
    
    // Then create each match activity
    for (const match of matchActivities) {
      console.log(`Creating match ${match.id}: ${match.name} with cupId: ${match.cupId}`);
      // Save the activity to the database and state
      await updateActivity(match);
      console.log(`Successfully created match ${match.id}: ${match.name}`);
    }
    
    console.log(`Successfully added ${matchActivities.length} matches to cup ${cupActivity.name}`);
    return matchActivities;
    
  } catch (error) {
    console.error("Error adding cup matches:", error);
    throw error;
  }
};
