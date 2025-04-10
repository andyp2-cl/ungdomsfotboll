import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "./types";

// Update match cup associations for cup activities
export const updateCupMatches = async (activity: Activity, activities: Activity[]): Promise<void> => {
  try {
    // For cup activities, update all match references
    if (activity.type === 'cup') {
      console.log(`Processing cup ${activity.name} (${activity.id}) with matches:`, activity.matches);
      
      if (activity.matches && activity.matches.length > 0) {
        // Get the match activities
        const matchActivities = activities.filter(a => activity.matches?.includes(a.id));
        console.log(`Found ${matchActivities.length} match activities for cup ${activity.name}`);
        
        // Update each match with the cup ID
        for (const matchActivity of matchActivities) {
          console.log(`Ensuring match ${matchActivity.name} has cupId ${activity.id}`);
          
          // Skip if the match already has the correct cupId
          if (matchActivity.cupId === activity.id) {
            console.log(`Match ${matchActivity.name} already has correct cupId`);
            continue;
          }
          
          // Update the match in the database with the cupId
          const { error: updateError } = await supabase
            .from('activities')
            .update({ cup_id: activity.id })
            .eq('id', matchActivity.id);
            
          if (updateError) {
            console.error(`Error updating cupId for match ${matchActivity.name}:`, updateError);
          } else {
            console.log(`Successfully updated cupId for match ${matchActivity.name}`);
            
            // Log the cup association
            await logDatabaseChange(
              'update',
              'activity',
              matchActivity.id,
              `Associated match "${matchActivity.name}" with cup "${activity.name}"`
            );
          }
        }
        
        // Store the matches array as a player_stats JSON field since we don't have a dedicated matches column
        // This keeps track of the match IDs that belong to this cup
        const { error: cupUpdateError } = await supabase
          .from('activities')
          .update({ 
            player_stats: {
              ...activity.player_stats,
              cup_matches: activity.matches 
            }
          })
          .eq('id', activity.id);
          
        if (cupUpdateError) {
          console.error(`Error updating cup matches in player_stats for cup ${activity.name}:`, cupUpdateError);
        } else {
          console.log(`Successfully updated cup matches in player_stats for cup ${activity.name}`);
          
          // Log the cup matches update
          await logDatabaseChange(
            'update',
            'activity',
            activity.id,
            `Updated cup "${activity.name}" with ${activity.matches.length} matches`
          );
        }
      }
    }
    
    // For match activities, ensure the cupId is set correctly
    if (activity.type === 'match' && activity.cupId) {
      console.log(`Processing match ${activity.name} with cupId ${activity.cupId}`);
      
      // Update the match in the database with the cupId
      const { error: updateError } = await supabase
        .from('activities')
        .update({ cup_id: activity.cupId })
        .eq('id', activity.id);
        
      if (updateError) {
        console.error(`Error updating cupId for match ${activity.name}:`, updateError);
      } else {
        console.log(`Successfully updated cupId for match ${activity.name}`);
        
        // Also find the cup and add this match to its matches array if not already there
        const cup = activities.find(a => a.id === activity.cupId);
        if (cup) {
          const cupMatches = cup.matches || [];
          if (!cupMatches.includes(activity.id)) {
            const updatedMatches = [...cupMatches, activity.id];
            
            // Update the cup's player_stats to include this match
            const { error: cupUpdateError } = await supabase
              .from('activities')
              .update({ 
                player_stats: {
                  ...cup.player_stats,
                  cup_matches: updatedMatches
                }
              })
              .eq('id', cup.id);
              
            if (cupUpdateError) {
              console.error(`Error adding match to cup's player_stats:`, cupUpdateError);
            } else {
              console.log(`Successfully added match ${activity.name} to cup ${cup.name}'s player_stats`);
              
              // Log the cup association
              await logDatabaseChange(
                'update',
                'activity',
                cup.id,
                `Added match "${activity.name}" to cup "${cup.name}"`
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error updating cup matches:", error);
  }
};
