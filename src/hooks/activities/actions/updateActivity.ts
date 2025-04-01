
import { Activity, Player } from "@/types/player";
import { saveActivities, savePlayers } from "@/utils/storage";
import { normalizePlayerStats } from "../utils/playerStatsUtils";

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
) => {
  console.log("handleActivityUpdate called with:", {
    activityId: updatedActivity.id,
    activityName: updatedActivity.name
  });
  
  try {
    // Find the existing activity
    const existingActivity = activities.find(activity => activity.id === updatedActivity.id);
    
    if (!existingActivity) {
      console.error("Activity not found:", updatedActivity.id);
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
    
    // Update state first to prevent UI freezes
    setActivities(updatedActivities);
    
    // Create a clone to avoid mutation during async operations
    const activitiesClone = [...updatedActivities];
    
    // Save to storage in the background
    await saveActivities(activitiesClone);
    
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
      await savePlayers(updatedPlayers);
    }
    
    toast({
      title: "Aktivitet uppdaterad",
      description: `${normalizedActivity.name} har uppdaterats.`,
    });
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
