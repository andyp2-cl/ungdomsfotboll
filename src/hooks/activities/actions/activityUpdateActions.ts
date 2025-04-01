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
  
  // Find the existing activity
  const existingActivity = activities.find(activity => activity.id === updatedActivity.id);
  
  if (!existingActivity) {
    console.error("Activity not found:", updatedActivity.id);
    return;
  }

  // Create a deep copy before making any changes to avoid mutations
  const updatedActivities = activities.map(activity => 
    activity.id === updatedActivity.id ? updatedActivity : activity
  );
  
  // Update state first to prevent UI freezes
  setActivities(updatedActivities);
  
  try {
    // Save to storage in the background
    await saveActivities(updatedActivities);
    
    // Update player-activity relationships if needed
    if (updatedActivity.participants) {
      const updatedPlayers = players.map(player => {
        const isParticipating = updatedActivity.participants?.includes(player.id);
        let playerActivities = player.activities || [];
        
        if (isParticipating && !playerActivities.includes(updatedActivity.id)) {
          return {
            ...player,
            activities: [...playerActivities, updatedActivity.id]
          };
        } else if (!isParticipating && playerActivities.includes(updatedActivity.id)) {
          return {
            ...player,
            activities: playerActivities.filter(id => id !== updatedActivity.id)
          };
        }
        
        return player;
      });
      
      setPlayers(updatedPlayers);
      await savePlayers(updatedPlayers);
    }
    
    toast({
      title: "Aktivitet uppdaterad",
      description: `${updatedActivity.name} har uppdaterats.`,
    });
  } catch (error) {
    console.error("Error saving activity updates:", error);
    
    // Revert state on error
    setActivities(activities);
    
    toast({
      title: "Ett fel uppstod",
      description: "Kunde inte spara ändringarna. Försök igen.",
      variant: "destructive"
    });
  }
};

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
