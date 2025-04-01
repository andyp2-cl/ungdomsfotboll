
import { Activity, Player } from "@/types/player";
import { saveActivities, savePlayers } from "@/utils/storage";

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
  const existingActivity = activities.find(activity => activity.id === updatedActivity.id);
  
  if (!existingActivity) {
    console.error("Activity not found:", updatedActivity.id);
    return;
  }
  
  // Make sure we properly merge the player_stats and preserve the result data
  const mergedActivity = {
    ...existingActivity,
    ...updatedActivity,
    player_stats: updatedActivity.player_stats || existingActivity.player_stats,
    result: updatedActivity.result ?? existingActivity.result
  };
  
  console.log("Updating activity with data:", mergedActivity);
  
  const updatedActivities = activities.map(activity => 
    activity.id === mergedActivity.id ? mergedActivity : activity
  );
  
  setActivities(updatedActivities);
  await saveActivities(updatedActivities);
  
  if (mergedActivity.participants) {
    const updatedPlayers = players.map(player => {
      const isParticipating = mergedActivity.participants?.includes(player.id);
      let playerActivities = player.activities || [];
      
      if (isParticipating && !playerActivities.includes(mergedActivity.id)) {
        return {
          ...player,
          activities: [...playerActivities, mergedActivity.id]
        };
      } else if (!isParticipating && playerActivities.includes(mergedActivity.id)) {
        return {
          ...player,
          activities: playerActivities.filter(id => id !== mergedActivity.id)
        };
      }
      
      return player;
    });
    
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);
  }
  
  toast({
    title: "Aktivitet uppdaterad",
    description: `${mergedActivity.name} har uppdaterats.`,
  });
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
