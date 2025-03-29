
import { Activity, Player } from "@/types/player";
import { saveActivities, savePlayers } from "@/utils/storage";
import { logDatabaseChange } from "@/lib/supabase";

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
    const updatedActivities = activities.map(activity => 
      activity.id === updatedActivity.id ? updatedActivity : activity
    );
    
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
    
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

  const handleDeleteAllActivities = async () => {
    setActivities([]);
    await saveActivities([]);
    
    await logDatabaseChange(
      'delete',
      'activity',
      'all',
      'Alla aktiviteter har raderats manuellt'
    );
    
    toast({
      title: "Aktiviteter raderade",
      description: "Alla aktiviteter har tagits bort.",
    });
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
    handleKioskAssignmentUpdate,
    handleAddActivity,
    handleImportedActivities,
    handleScrapedMatches,
    handleDeleteAllActivities,
    handleClearHistoricalActivities
  };
}
