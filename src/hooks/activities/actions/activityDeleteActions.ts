
import { Activity, Player } from "@/types/player";
import { deleteActivityFromDatabase } from "./activityDatabaseActions";
import { saveActivities } from "@/utils/storage";

/**
 * Deletes an activity
 */
export const handleDeleteActivity = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  players: Player[],
  setPlayers: (players: Player[]) => void,
  toast: any,
  activityId: string
): Promise<boolean> => {
  try {
    console.log(`Deleting activity ${activityId}`);
    
    // Optimistically update the local state first for immediate UI feedback
    const updatedActivities = activities.filter(a => a.id !== activityId);
    setActivities(updatedActivities);
    
    // Remove activity from players
    const updatedPlayers = players.map(player => ({
      ...player,
      activities: player.activities ? player.activities.filter(id => id !== activityId) : []
    }));
    setPlayers(updatedPlayers);
    
    // Try to delete in database
    let success = await deleteActivityFromDatabase(activityId);
    
    // If database deletion failed, save updated activities list to local storage
    if (!success) {
      try {
        await saveActivities(updatedActivities);
        console.log("Updated activities saved to local storage after deletion");
        success = true;
      } catch (saveError) {
        console.error("Error saving updated activities to local storage:", saveError);
      }
    }
    
    // Force refresh local cache to ensure data consistency
    localStorage.removeItem('cachedActivities');
    localStorage.removeItem('sb-activities-fetch-time');
    
    if (success) {
      toast({
        title: "Aktivitet borttagen",
        description: "Aktiviteten har tagits bort.",
      });
      return true;
    } else {
      toast({
        title: "Kunde inte ta bort aktivitet fullständigt",
        description: "Aktiviteten har tagits bort lokalt men inte i databasen.",
        variant: "destructive"
      });
      return false;
    }
  } catch (error) {
    console.error("Error handling activity deletion:", error);
    toast({
      title: "Kunde inte ta bort aktivitet",
      description: "Ett fel uppstod när aktiviteten skulle tas bort. Försök igen.",
      variant: "destructive"
    });
    return false;
  }
};
