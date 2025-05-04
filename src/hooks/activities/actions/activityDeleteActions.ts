
import { Activity, Player } from "@/types/player";
import { saveActivities, savePlayers } from "@/utils/storage";
import { logDatabaseChange, permanentlyDeleteActivity } from "@/lib/supabase";

/**
 * Handles deleting an activity and related cleanup
 */
export const handleDeleteActivity = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  players: Player[],
  setPlayers: (players: Player[]) => void,
  toast: any,
  activityId: string
): Promise<boolean> => {
  const activityToDelete = activities.find(activity => activity.id === activityId);
  
  if (!activityToDelete) {
    toast({
      title: "Fel",
      description: "Kunde inte hitta aktiviteten",
      variant: "destructive"
    });
    return false;
  }
  
  try {
    const deleteResult = await permanentlyDeleteActivity(activityId);
    
    if (!deleteResult) {
      toast({
        title: "Fel vid radering",
        description: "Ett fel uppstod när aktiviteten skulle raderas från databasen.",
        variant: "destructive"
      });
      return false;
    }
    
    const updatedActivities = activities.filter(activity => activity.id !== activityId);
    
    if (activityToDelete.cupId) {
      const parentCup = updatedActivities.find(a => a.id === activityToDelete.cupId);
      if (parentCup && parentCup.matches) {
        parentCup.matches = parentCup.matches.filter(matchId => matchId !== activityId);
        console.log(`Removed match ${activityId} from cup ${parentCup.id}`);
      }
    }
    
    if (activityToDelete.type === 'cup' && activityToDelete.matches && activityToDelete.matches.length > 0) {
      const matchesToDelete = activityToDelete.matches;
      console.log(`Deleting ${matchesToDelete.length} matches for cup ${activityToDelete.id}`);
      
      for (const matchId of matchesToDelete) {
        await permanentlyDeleteActivity(matchId);
        console.log(`Deleted match ${matchId} from cup ${activityToDelete.id}`);
      }
      
      const remainingActivities = updatedActivities.filter(a => !matchesToDelete.includes(a.id));
      setActivities(remainingActivities);
      await saveActivities(remainingActivities);
    } else {
      setActivities(updatedActivities);
      await saveActivities(updatedActivities);
    }
    
    const updatedPlayers = players.map(player => {
      if (player.activities?.includes(activityId)) {
        return {
          ...player,
          activities: player.activities.filter(id => id !== activityId)
        };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);
    
    await logDatabaseChange(
      'delete',
      'activity',
      activityId,
      `Aktivitet "${activityToDelete.name}" har raderats permanent`
    );
    
    toast({
      title: "Aktivitet raderad",
      description: `${activityToDelete.name} har tagits bort permanent.`,
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting activity:", error);
    toast({
      title: "Fel vid radering",
      description: "Ett fel uppstod när aktiviteten skulle raderas.",
      variant: "destructive"
    });
    return false;
  }
};
