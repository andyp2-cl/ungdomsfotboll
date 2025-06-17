import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { v4 as uuidv4 } from 'uuid';
import { Activity } from "@/types/player";
import { PlayerStats } from "@/types/player";

// Handle participant relationships for an activity
export const updateActivityParticipants = async (activity: Activity): Promise<void> => {
  if (!activity.id) {
    console.error("Cannot update participants: Activity ID is missing");
    throw new Error("Activity ID is missing");
  }
  
  try {
    console.log(`[updateActivityParticipants] Starting update for activity ${activity.id} (${activity.name})`);
    console.log(`[updateActivityParticipants] Current participants:`, activity.participants);
    
    // If this is a cup activity, update matches first
    if (activity.type === 'cup' && activity.matches && activity.matches.length > 0) {
      console.log(`[updateActivityParticipants] This is a cup activity with ${activity.matches.length} matches. Updating matches first...`);
      
      // Get all matches for this cup
      const { data: matchActivities, error: matchError } = await supabase
        .from('activities')
        .select('*')
        .in('id', activity.matches);
        
      if (matchError) {
        console.error("[updateActivityParticipants] Error fetching cup matches:", matchError);
        throw matchError;
      }
      
      if (!matchActivities || matchActivities.length === 0) {
        console.warn(`[updateActivityParticipants] No matches found for cup ${activity.id}`);
      } else {
        console.log(`[updateActivityParticipants] Found ${matchActivities.length} matches to update`);
        
        // Update participants for each match
        for (const match of matchActivities) {
          console.log(`[updateActivityParticipants] Updating participants for match ${match.id} (${match.name})`);
          
          // Get current relationships for this match
          const { data: existingMatchRelationships, error: fetchMatchError } = await supabase
            .from('player_activities')
            .select('*')
            .eq('activity_id', match.id);
            
          if (fetchMatchError) {
            console.error("[updateActivityParticipants] Error fetching match participant relationships:", fetchMatchError);
            throw fetchMatchError;
          }
          
          const existingMatchPlayerIds = existingMatchRelationships?.map(relation => relation.player_id) || [];
          
          // Determine which participants to add and remove for the match
          const matchPlayersToAdd = activity.participants.filter(id => !existingMatchPlayerIds.includes(id));
          const matchPlayersToRemove = existingMatchPlayerIds.filter(id => !activity.participants.includes(id));
          
          // Remove participants from match
          if (matchPlayersToRemove.length > 0) {
            const { error: deleteMatchError } = await supabase
              .from('player_activities')
              .delete()
              .eq('activity_id', match.id)
              .in('player_id', matchPlayersToRemove);
              
            if (deleteMatchError) {
              console.error("[updateActivityParticipants] Error removing match participants:", deleteMatchError);
              throw deleteMatchError;
            }
          }
          
          // Add new participants to match
          if (matchPlayersToAdd.length > 0) {
            const newMatchRelationships = matchPlayersToAdd.map(playerId => ({
              id: uuidv4(),
              activity_id: match.id,
              player_id: playerId
            }));
            
            const { error: insertMatchError } = await supabase
              .from('player_activities')
              .insert(newMatchRelationships);
              
            if (insertMatchError) {
              console.error("[updateActivityParticipants] Error adding match participants:", insertMatchError);
              throw insertMatchError;
            }
          }
          
          // Verify match participants
          const { data: verifyMatchData, error: verifyMatchError } = await supabase
            .from('player_activities')
            .select('*')
            .eq('activity_id', match.id);
            
          if (verifyMatchError) {
            console.error("[updateActivityParticipants] Error verifying match participants:", verifyMatchError);
            throw verifyMatchError;
          }
          
          const matchParticipantIds = verifyMatchData?.map(r => r.player_id) || [];
          if (matchParticipantIds.length !== activity.participants.length || 
              !matchParticipantIds.every(id => activity.participants.includes(id))) {
            console.error(`[updateActivityParticipants] Match ${match.id} participant verification failed:`);
            console.error("Expected:", activity.participants);
            console.error("Got:", matchParticipantIds);
            throw new Error(`Match ${match.id} participant verification failed`);
          }
          
          console.log(`[updateActivityParticipants] Successfully updated participants for match ${match.id}`);
        }
      }
    }
    
    // Now update the cup/activity itself
    // Get current relationships for this activity
    const { data: existingRelationships, error: fetchError } = await supabase
      .from('player_activities')
      .select('*')
      .eq('activity_id', activity.id);
      
    if (fetchError) {
      console.error("[updateActivityParticipants] Error fetching existing participant relationships:", fetchError);
      throw fetchError;
    }
    
    const existingPlayerIds = existingRelationships?.map(relation => relation.player_id) || [];
    console.log(`[updateActivityParticipants] Found ${existingPlayerIds.length} existing participants:`, existingPlayerIds);
    
    // If no participants in activity, just remove all
    if (!activity.participants || activity.participants.length === 0) {
      if (existingPlayerIds.length > 0) {
        const { error: deleteAllError } = await supabase
          .from('player_activities')
          .delete()
          .eq('activity_id', activity.id);
          
        if (deleteAllError) {
          console.error("[updateActivityParticipants] Error deleting all participant relationships:", deleteAllError);
          throw deleteAllError;
        }
      }
    } else {
      // Determine which participants to add and remove
      const playersToAdd = activity.participants.filter(id => !existingPlayerIds.includes(id));
      const playersToRemove = existingPlayerIds.filter(id => !activity.participants.includes(id));
      
      // Remove participants that are no longer in the list
      if (playersToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('player_activities')
          .delete()
          .eq('activity_id', activity.id)
          .in('player_id', playersToRemove);
          
        if (deleteError) {
          console.error("[updateActivityParticipants] Error removing participants:", deleteError);
          throw deleteError;
        }
      }
      
      // Add new participants
      if (playersToAdd.length > 0) {
        const newRelationships = playersToAdd.map(playerId => ({
          id: uuidv4(),
          activity_id: activity.id,
          player_id: playerId
        }));
        
        const { error: insertError } = await supabase
          .from('player_activities')
          .insert(newRelationships);
          
        if (insertError) {
          console.error("[updateActivityParticipants] Error adding participants:", insertError);
          throw insertError;
        }
      }
    }
    
    // Final verification for the main activity
    const { data: finalRelationships, error: verifyError } = await supabase
      .from('player_activities')
      .select('*')
      .eq('activity_id', activity.id);
      
    if (verifyError) {
      console.error("[updateActivityParticipants] Error verifying final state:", verifyError);
      throw verifyError;
    }
    
    const finalParticipantIds = finalRelationships?.map(r => r.player_id) || [];
    const expectedParticipantIds = activity.participants || [];
    
    if (finalParticipantIds.length !== expectedParticipantIds.length || 
        !finalParticipantIds.every(id => expectedParticipantIds.includes(id))) {
      console.error("[updateActivityParticipants] Final verification failed:");
      console.error("Expected:", expectedParticipantIds);
      console.error("Got:", finalParticipantIds);
      throw new Error("Final participant verification failed");
    }
    
    console.log(`[updateActivityParticipants] Successfully updated all participants for activity ${activity.id}`);
    
  } catch (error) {
    console.error(`[updateActivityParticipants] Error updating participants for activity ${activity.id}:`, error);
    throw error;
  }
};
