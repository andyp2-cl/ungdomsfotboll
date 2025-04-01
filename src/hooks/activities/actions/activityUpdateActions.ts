
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
  const existingActivity = activities.find(activity => activity.id === updatedActivity.id);
  
  if (!existingActivity) {
    console.error("Activity not found:", updatedActivity.id);
    return;
  }
  
  // Make sure player_stats is never a string before merging
  if (existingActivity.player_stats && typeof existingActivity.player_stats === 'string') {
    try {
      existingActivity.player_stats = JSON.parse(existingActivity.player_stats);
    } catch (e) {
      console.error("Error parsing existing player_stats:", e);
      existingActivity.player_stats = { goals: {}, assists: {} };
    }
  }
  
  if (updatedActivity.player_stats && typeof updatedActivity.player_stats === 'string') {
    try {
      updatedActivity.player_stats = JSON.parse(updatedActivity.player_stats);
    } catch (e) {
      console.error("Error parsing updated player_stats:", e);
      updatedActivity.player_stats = { goals: {}, assists: {} };
    }
  }
  
  // Use the preserveMatchData utility function to properly merge activities
  // This ensures match results are never lost
  const mergedActivity = preserveMatchData(existingActivity, updatedActivity);
  
  console.log("Updating activity with preserved match data:", {
    existingActivity: {
      id: existingActivity.id,
      playerStats: existingActivity.player_stats,
      playerStatsType: typeof existingActivity.player_stats
    },
    updatedActivity: {
      id: updatedActivity.id,
      playerStats: updatedActivity.player_stats,
      playerStatsType: typeof updatedActivity.player_stats
    },
    mergedActivity: {
      id: mergedActivity.id,
      playerStats: mergedActivity.player_stats,
      playerStatsType: typeof mergedActivity.player_stats
    }
  });
  
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
