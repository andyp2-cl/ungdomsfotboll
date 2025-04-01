import { Activity, Player } from "@/types/player";
import { saveActivities, savePlayers } from "@/utils/storage";
import { preserveMatchData } from "../utils/arrayUtils";

/**
 * Hjälpfunktion för att säkerställa player_stats är alltid ett objekt
 */
function ensurePlayerStatsObject(playerStats: any) {
  if (!playerStats) {
    return { goals: {}, assists: {} };
  }
  
  if (typeof playerStats === 'string') {
    try {
      const parsed = JSON.parse(playerStats);
      
      // Handle double-stringified JSON
      if (typeof parsed === 'string') {
        try {
          const doubleDecoded = JSON.parse(parsed);
          return {
            ...doubleDecoded,
            goals: doubleDecoded.goals || {},
            assists: doubleDecoded.assists || {}
          };
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
  
  // Ensure required properties exist
  return {
    ...playerStats,
    goals: playerStats.goals || {},
    assists: playerStats.assists || {}
  };
}

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
    playerStatsType: typeof updatedActivity.player_stats,
    homeScore: updatedActivity.homeScore,
    awayScore: updatedActivity.awayScore,
    isWin: updatedActivity.isWin
  });
  
  const existingActivity = activities.find(activity => activity.id === updatedActivity.id);
  
  if (!existingActivity) {
    console.error("Activity not found:", updatedActivity.id);
    return;
  }
  
  console.log("Existing activity:", {
    id: existingActivity.id,
    playerStatsType: typeof existingActivity.player_stats,
    playerStats: existingActivity.player_stats
  });
  
  // Ensure player_stats is never a string in either activity before merging
  const cleanExistingActivity = {
    ...existingActivity,
    player_stats: ensurePlayerStatsObject(existingActivity.player_stats)
  };
  
  const cleanUpdatedActivity = {
    ...updatedActivity,
    player_stats: ensurePlayerStatsObject(updatedActivity.player_stats)
  };
  
  // Use the preserveMatchData utility function to properly merge activities
  // This ensures match results are never lost
  const mergedActivity = preserveMatchData(cleanExistingActivity, cleanUpdatedActivity);
  
  console.log("Final merged activity:", {
    id: mergedActivity.id,
    playerStatsType: typeof mergedActivity.player_stats,
    playerStats: mergedActivity.player_stats
  });
  
  const updatedActivities = activities.map(activity => 
    activity.id === mergedActivity.id ? mergedActivity : activity
  );
  
  // Update state and save to storage
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
