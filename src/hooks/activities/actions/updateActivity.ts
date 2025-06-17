import { Activity, Player } from "@/types/player";
import { saveActivities, savePlayers } from "@/utils/storage";
import { normalizePlayerStats } from "../utils/playerStatsUtils";
import { supabase } from "@/lib/supabase/client";

/**
 * Handles updating an existing activity
 */
export const handleActivityUpdate = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  players: Player[],
  setPlayers: (players: Player[]) => void,
  toast: any,
  updatedActivity: Activity
): Promise<void> => {
  console.log("handleActivityUpdate called with:", {
    activityId: updatedActivity.id,
    activityName: updatedActivity.name,
    date: updatedActivity.date,
    cupId: updatedActivity.cupId,
    cupName: updatedActivity.cupName,
    participantsCount: updatedActivity.participants?.length || 0
  });
  
  try {
    // Find the existing activity
    const existingActivity = activities.find(activity => activity.id === updatedActivity.id);
    
    if (!existingActivity) {
      console.error("Activity not found:", updatedActivity.id);
      toast({
        title: "Kunde inte uppdatera aktivitet",
        description: "Aktiviteten hittades inte.",
        variant: "destructive"
      });
      return;
    }

    // Normalize player_stats before updating
    const normalizedActivity = {
      ...updatedActivity,
      player_stats: normalizePlayerStats(updatedActivity.player_stats)
    };
    
    // Create updated activities array
    const updatedActivities = activities.map(activity => 
      activity.id === normalizedActivity.id ? normalizedActivity : activity
    );

    // If this is a cup activity, we need to sync participants with all cup matches
    if (normalizedActivity.cupId) {
      try {
        // Get all matches for this cup
        const { data: cupMatches, error: cupMatchesError } = await supabase
          .from('activities')
          .select('*')
          .eq('cupId', normalizedActivity.cupId);

        if (cupMatchesError) {
          throw cupMatchesError;
        }

        // Update all cup matches with the same participants
        const updatedCupMatches = cupMatches.map(match => ({
          ...match,
          participants: normalizedActivity.participants
        }));

        // Save all cup matches to database
        await saveActivities(updatedCupMatches);

        // Update local state for all cup matches
        const allUpdatedActivities = activities.map(activity => {
          if (activity.cupId === normalizedActivity.cupId) {
            return {
              ...activity,
              participants: normalizedActivity.participants
            };
          }
          return activity;
        });

        setActivities(allUpdatedActivities);
      } catch (cupError) {
        console.error("Error syncing cup matches:", cupError);
        toast({
          title: "Varning",
          description: "Kunde inte synkronisera alla cup-matcher. Försök igen.",
          variant: "destructive"
        });
        throw cupError;
      }
    }
    
    // Try to save to database FIRST, before updating UI state
    try {
      console.log("Saving activity to database:", normalizedActivity.id, "with date:", normalizedActivity.date);
      
      // Create a clean copy that won't be mutated by other code
      const activityToSave = JSON.parse(JSON.stringify(normalizedActivity));
      
      await saveActivities([activityToSave]);
      console.log("Activity saved successfully to database");
      
      // Only update state AFTER successful database save
      setActivities(updatedActivities);
      
      // Update player-activity relationships if needed
      if (normalizedActivity.participants) {
        const updatedPlayers = players.map(player => {
          const isParticipating = normalizedActivity.participants?.includes(player.id);
          let playerActivities = player.activities || [];
          
          if (isParticipating && !playerActivities.includes(normalizedActivity.id)) {
            return {
              ...player,
              activities: [...playerActivities, normalizedActivity.id]
            };
          } else if (!isParticipating && playerActivities.includes(normalizedActivity.id)) {
            return {
              ...player,
              activities: playerActivities.filter(id => id !== normalizedActivity.id)
            };
          }
          
          return player;
        });
        
        setPlayers(updatedPlayers);
        
        // Create a copy of the players list to avoid mutations
        const playersToSave = JSON.parse(JSON.stringify(updatedPlayers));
        await savePlayers(playersToSave);
      }
      
      // Show success notification AFTER everything is saved
      toast({
        title: "Aktivitet uppdaterad",
        description: `${normalizedActivity.name} har uppdaterats.`,
      });
    } catch (saveError) {
      console.error("Error saving activity to database:", saveError);
      toast({
        title: "Databasfel",
        description: "Det gick inte att spara aktiviteten till databasen. Försök igen.",
        variant: "destructive"
      });
      throw saveError;
    }
  } catch (error) {
    console.error("Error saving activity updates:", error);
    
    toast({
      title: "Ett fel uppstod",
      description: "Kunde inte spara ändringarna. Försök igen.",
      variant: "destructive"
    });
    
    throw error; // Re-throw to allow caller to handle
  }
};
