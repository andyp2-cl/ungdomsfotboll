
import { supabase } from "@/lib/supabase";
import { Activity } from "@/types/player";
import { extractCupMatchesFromPlayerStats, addMatchToPlayerStats } from "./utils";

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
            player_stats: activity.player_stats,
            type: activity.type
          })
          .eq('id', activity.id);
          
        if (updateError) {
          console.error(`Error updating cup activity: ${updateError.message}`);
        } else {
          console.log(`Successfully updated cup ${activity.id} with ${allMatchIds.length} matches`);
          
          // Also update all matches to make sure they reference this cup
          for (const matchId of allMatchIds) {
            console.log(`Ensuring match ${matchId} has cupId set to ${activity.id}`);
            await supabase
              .from('activities')
              .update({ cup_id: activity.id })
              .eq('id', matchId);
          }
        }
      }
    }
    
    // If the activity is a match with a cupId, ensure it's in the cup's matches array
    if (activity.cupId) {
      console.log(`Processing match ${activity.name} (${activity.id}) with cupId: ${activity.cupId}`);
      
      // First, update this match to ensure its cup_id field is set correctly
      const { error: matchUpdateError } = await supabase
        .from('activities')
        .update({ cup_id: activity.cupId })
        .eq('id', activity.id);
        
      if (matchUpdateError) {
        console.error(`Error updating match with cupId: ${matchUpdateError.message}`);
      } else {
        console.log(`Updated match ${activity.id} with cupId ${activity.cupId}`);
      }
      
      // Then find the parent cup activity
      const { data: parentCup, error: parentCupError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activity.cupId)
        .single();
        
      if (parentCupError) {
        console.error(`Error fetching parent cup: ${parentCupError.message}`);
      } else if (parentCup) {
        // Get existing cup matches from player_stats
        let cupMatches = extractCupMatchesFromPlayerStats(parentCup.player_stats);
        
        // Add this match to the cup's matches if not already present
        if (!cupMatches.includes(activity.id)) {
          console.log(`Adding match ${activity.id} to cup ${parentCup.id}`);
          
          // Update player_stats with the new match ID
          const updatedPlayerStats = addMatchToPlayerStats(parentCup.player_stats, activity.id);
          
          // Update parent cup in database
          const { error: updateError } = await supabase
            .from('activities')
            .update({ 
              player_stats: updatedPlayerStats
            })
            .eq('id', parentCup.id);
            
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
