
import { Activity, Player } from "@/types/player";
import { saveActivities, savePlayers } from "@/utils/storage";
import { preserveMatchData } from "../utils/arrayUtils";

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
    
    // Revert state on error (optional: this could be causing issues if the error happens after state update)
    // setActivities(activities);
    
    toast({
      title: "Ett fel uppstod",
      description: "Kunde inte spara ändringarna. Försök igen.",
      variant: "destructive"
    });
    
    throw error; // Re-throw to allow caller to handle
  }
};

// Helper function to ensure player_stats is properly normalized
function normalizePlayerStats(playerStats: any) {
  if (!playerStats) {
    return { goals: {}, assists: {} };
  }
  
  if (typeof playerStats === 'string') {
    try {
      const parsed = JSON.parse(playerStats);
      if (typeof parsed === 'string') {
        try {
          return JSON.parse(parsed);
        } catch (e) {
          console.error("Error parsing double-stringified player_stats:", e);
          return { goals: {}, assists: {} };
        }
      }
      return {
        ...parsed,
        goals: parsed.goals || {},
        assists: parsed.assists || {}
      };
    } catch (e) {
      console.error("Error parsing player_stats string:", e);
      return { goals: {}, assists: {} };
    }
  }
  
  // Ensure the object has the required structure
  return {
    ...playerStats,
    goals: playerStats.goals || {},
    assists: playerStats.assists || {}
  };
}

/**
 * Handles assigning a player to kiosk duty for an activity
 */
export const handleKioskAssignmentUpdate = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  activityId: string, 
  playerId?: string
) => {
  const updatedActivities = activities.map(activity => 
    activity.id === activityId 
      ? { ...activity, kioskAssignedPlayerId: playerId }
      : activity
  );
  
  setActivities(updatedActivities);
  await saveActivities(updatedActivities);
  
  toast({
    title: "Kioskansvarig uppdaterad",
    description: playerId 
      ? `Ny spelare har tilldelats kioskansvar för denna aktivitet.`
      : `Kioskansvarig har tagits bort från denna aktivitet.`,
  });
};

/**
 * Handles adding a new activity
 */
export const handleAddActivity = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  newActivity: Activity
) => {
  const updatedActivities = [...activities, newActivity];
  setActivities(updatedActivities);
  await saveActivities(updatedActivities);
  
  toast({
    title: "Aktivitet tillagd",
    description: `${newActivity.name} har lagts till.`,
  });
};
