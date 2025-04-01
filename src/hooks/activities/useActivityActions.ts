
import { Activity, Player } from "@/types/player";
import { saveActivities, savePlayers } from "@/utils/storage";
import { logDatabaseChange, permanentlyDeleteActivity } from "@/lib/supabase";

export function useActivityActions(
  activities: Activity[], 
  setActivities: (activities: Activity[]) => void,
  players: Player[],
  setPlayers: (players: Player[]) => void,
  toast: any,
  currentActivities: Activity[],
  historicalActivities: Activity[]
) {
  const arePlayersEqual = (playersA: Player[], playersB: Player[]) => {
    if (playersA.length !== playersB.length) return false;
    
    for (let i = 0; i < playersA.length; i++) {
      const playerA = playersA[i];
      const playerB = playersB[i];
      
      if (playerA.id !== playerB.id) return false;
      
      if (!arraysEqual(playerA.activities || [], playerB.activities || [])) {
        return false;
      }
    }
    
    return true;
  };
  
  const arraysEqual = (a: any[], b: any[]) => {
    if (a.length !== b.length) return false;
    
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    
    for (let i = 0; i < sortedA.length; i++) {
      if (sortedA[i] !== sortedB[i]) return false;
    }
    
    return true;
  };

  const handleActivityUpdate = async (updatedActivity: Activity) => {
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

  const handleDeleteActivity = async (activityId: string) => {
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

  const handleKioskAssignmentUpdate = async (activityId: string, playerId?: string) => {
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

  const handleAddActivity = async (newActivity: Activity) => {
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
    
    toast({
      title: "Aktivitet tillagd",
      description: `${newActivity.name} har lagts till.`,
    });
  };

  const handleImportedActivities = async (importedActivities: Activity[]) => {
    const updatedActivities = [...activities, ...importedActivities];
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
    toast({
      title: "Aktiviteter importerade",
      description: `${importedActivities.length} aktiviteter har importerats från fil.`,
    });
  };

  const handleScrapedMatches = async (newActivities: Activity[], clearExisting: boolean = false) => {
    if (clearExisting) {
      setActivities(newActivities);
      await saveActivities(newActivities);
      toast({
        title: "Aktiviteter ersatta",
        description: `Alla tidigare aktiviteter har tagits bort och ${newActivities.length} nya aktiviteter har lagts till.`,
      });
    } else {
      const updatedActivities = [...activities, ...newActivities];
      setActivities(updatedActivities);
      await saveActivities(updatedActivities);
      toast({
        title: "Matcher importerade",
        description: `${newActivities.length} nya matcher har lagts till.`,
      });
    }
  };

  const handleClearHistoricalActivities = async () => {
    if (historicalActivities.length === 0) {
      toast({
        title: "Inga tidigare aktiviteter",
        description: "Det finns inga tidigare aktiviteter att rensa.",
      });
      return;
    }
    
    const countCleared = historicalActivities.length;
    
    try {
      await logDatabaseChange(
        'delete',
        'activity',
        'historical',
        `${countCleared} tidigare aktiviteter har rensats manuellt`
      );
      console.log(`Logged clearing of ${countCleared} historical activities`);
    } catch (error) {
      console.error('Error logging historical activities clearing:', error);
    }
    
    setActivities(currentActivities);
    await saveActivities(currentActivities);
    
    const historicalActivityIds = historicalActivities.map(a => a.id);
    const updatedPlayers = players.map(player => {
      if (player.activities && player.activities.some(id => historicalActivityIds.includes(id))) {
        return {
          ...player,
          activities: player.activities.filter(id => !historicalActivityIds.includes(id))
        };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);
    
    toast({
      title: "Tidigare aktiviteter rensade",
      description: `${countCleared} tidigare aktiviteter har tagits bort.`,
    });
  };

  return {
    handleActivityUpdate,
    handleDeleteActivity,
    handleKioskAssignmentUpdate,
    handleAddActivity,
    handleImportedActivities,
    handleScrapedMatches,
    handleClearHistoricalActivities
  };
}
