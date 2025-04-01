
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";

/**
 * Handles importing multiple activities from a file
 */
export const handleImportedActivities = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  importedActivities: Activity[]
) => {
  const updatedActivities = [...activities, ...importedActivities];
  setActivities(updatedActivities);
  await saveActivities(updatedActivities);
  toast({
    title: "Aktiviteter importerade",
    description: `${importedActivities.length} aktiviteter har importerats från fil.`,
  });
};

/**
 * Handles scraped matches from external sources
 */
export const handleScrapedMatches = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  newActivities: Activity[], 
  clearExisting: boolean = false
) => {
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

/**
 * Handles clearing historical activities
 */
export const handleClearHistoricalActivities = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  players: Player[],
  setPlayers: (players: Player[]) => void,
  toast: any,
  currentActivities: Activity[],
  historicalActivities: Activity[]
) => {
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
