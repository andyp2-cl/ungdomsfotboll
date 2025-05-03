
import { Activity, Player } from "@/types/player";
import { handleActivityUpdate, handleKioskAssignmentUpdate, handleAddActivity, handleMatchResultUpdate } from "./actions/activityUpdateActions";
import { handleImportedActivities, handleScrapedMatches, handleClearHistoricalActivities } from "./actions/activityBatchActions";
import { handleDeleteActivity } from "./actions/activityDeleteActions";

/**
 * Hook that provides actions for managing activities
 */
export function useActivityActions(
  activities: Activity[], 
  setActivities: (activities: Activity[]) => void,
  players: Player[],
  setPlayers: (players: Player[]) => void,
  toast: any,
  currentActivities: Activity[],
  historicalActivities: Activity[]
) {
  return {
    handleActivityUpdate: async (updatedActivity: Activity): Promise<void> => 
      await handleActivityUpdate(activities, setActivities, players, setPlayers, toast, updatedActivity),
      
    handleDeleteActivity: (activityId: string) => 
      handleDeleteActivity(activities, setActivities, players, setPlayers, toast, activityId),
      
    handleKioskAssignmentUpdate: (activityId: string, playerId?: string) =>
      handleKioskAssignmentUpdate(activities, setActivities, toast, activityId, playerId),
      
    handleAddActivity: (newActivity: Activity) =>
      handleAddActivity(activities, setActivities, toast, newActivity),
      
    handleMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number): Promise<boolean> =>
      handleMatchResultUpdate(activities, setActivities, toast, activityId, homeScore, awayScore),
      
    handleImportedActivities: (importedActivities: Activity[]) =>
      handleImportedActivities(activities, setActivities, toast, importedActivities),
      
    handleScrapedMatches: (newActivities: Activity[], clearExisting: boolean = false) =>
      handleScrapedMatches(activities, setActivities, toast, newActivities, clearExisting),
      
    handleClearHistoricalActivities: () =>
      handleClearHistoricalActivities(
        activities, 
        setActivities, 
        players, 
        setPlayers, 
        toast, 
        currentActivities, 
        historicalActivities
      )
  };
}
