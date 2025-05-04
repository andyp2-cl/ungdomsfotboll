
import { toast } from "sonner";

export function usePlayerPageWrappers(
  handlePlayerUpdate: any,
  handleBulkPlayerUpdate: any,
  handleAddPlayer: any,
  handleKioskUpdate: any,
  handleImportActivities: any,
  handleClearHistorical: any,
  handleMatchResultUpdate: any,
  setViewMode: any
) {
  // Debug data access
  console.log("usePlayerPageWrappers initialized with handlers:", {
    playerUpdateAvailable: !!handlePlayerUpdate,
    bulkUpdateAvailable: !!handleBulkPlayerUpdate,
    addPlayerAvailable: !!handleAddPlayer,
    kioskUpdateAvailable: !!handleKioskUpdate,
    importActivitiesAvailable: !!handleImportActivities,
    clearHistoricalAvailable: !!handleClearHistorical,
    matchResultUpdateAvailable: !!handleMatchResultUpdate,
    viewModeAvailable: !!setViewMode,
  });

  // Create a wrapper function for handlePlayerUpdate that shows toast notifications
  const handlePlayerUpdateWrapper = async (player: any) => {
    try {
      await handlePlayerUpdate(player);
      toast.success(`Spelare ${player.name} uppdaterad`);
    } catch (err) {
      console.error("Error in handlePlayerUpdateWrapper:", err);
      toast.error(`Kunde inte uppdatera spelare: ${(err as Error).message}`);
    }
  };

  // Create a wrapper function for handleBulkPlayerUpdate that shows toast notifications
  const handleBulkPlayerUpdateWrapper = async (players: any[], data: any) => {
    try {
      await handleBulkPlayerUpdate(players, data);
      toast.success(`${players.length} spelare uppdaterade`);
    } catch (err) {
      console.error("Error in handleBulkPlayerUpdateWrapper:", err);
      toast.error(`Kunde inte uppdatera spelare: ${(err as Error).message}`);
    }
  };

  // Create a wrapper function for handleAddPlayer that shows toast notifications
  const handleAddPlayerWrapper = async (player: any) => {
    try {
      const newPlayer = await handleAddPlayer(player);
      toast.success(`Spelare ${player.name} tillagd`);
      return newPlayer;
    } catch (err) {
      console.error("Error in handleAddPlayerWrapper:", err);
      toast.error(`Kunde inte lägga till spelare: ${(err as Error).message}`);
      return null;
    }
  };

  // Wrapper for kiosk
  const handleKioskUpdateWrapper = async (activityId: string, playerId?: string) => {
    try {
      const result = await handleKioskUpdate(activityId, playerId);
      toast.success("Kioskuppdrag tilldelat");
      return result;
    } catch (err) {
      console.error("Error in handleKioskUpdateWrapper:", err);
      toast.error(`Kunde inte tilldela kioskuppdrag: ${(err as Error).message}`);
      return false;
    }
  };

  // Wrapper for importing activities
  const handleImportActivitiesWrapper = async (activities: any[]) => {
    try {
      const result = await handleImportActivities(activities);
      toast.success(`${activities.length} aktiviteter importerade`);
      return result;
    } catch (err) {
      console.error("Error in handleImportActivitiesWrapper:", err);
      toast.error(`Kunde inte importera aktiviteter: ${(err as Error).message}`);
      return false;
    }
  };

  // Wrapper for clearing historical
  const handleClearHistoricalWrapper = async () => {
    try {
      const result = await handleClearHistorical();
      toast.success("Historiska aktiviteter har rensats");
      return result;
    } catch (err) {
      console.error("Error in handleClearHistoricalWrapper:", err);
      toast.error(`Kunde inte rensa historiska aktiviteter: ${(err as Error).message}`);
      return false;
    }
  };

  // Wrapper for match result updates
  const handleMatchResultWrapper = async (activityId: string, homeScore?: number, awayScore?: number) => {
    console.log("handleMatchResultWrapper called with:", activityId, homeScore, awayScore);
    try {
      if (!handleMatchResultUpdate) {
        console.error("handleMatchResultUpdate function is not available");
        toast.error("Kunde inte uppdatera matchresultat: funktion saknas");
        return false;
      }
      
      const result = await handleMatchResultUpdate(activityId, homeScore, awayScore);
      console.log(`Match result update for ${activityId} returned:`, result);
      
      if (result) {
        toast.success("Matchresultat sparat");
      } else {
        toast.warning("Kunde inte spara matchresultat i databasen");
      }
      
      return result;
    } catch (err) {
      console.error("Error in handleMatchResultWrapper:", err);
      toast.error(`Kunde inte uppdatera matchresultat: ${(err as Error).message}`);
      return false;
    }
  };

  // Wrapper for setViewMode
  const setViewModeWrapper = (mode: string) => {
    try {
      setViewMode(mode);
    } catch (err) {
      console.error("Error in setViewModeWrapper:", err);
      toast.error(`Kunde inte ändra visningsläge: ${(err as Error).message}`);
    }
  };

  // Debug data refresh
  const handleRefresh = async () => {
    console.log("Refreshing data...");
    toast.info("Uppdaterar data...");
    
    // Clear any cached data
    localStorage.removeItem('cachedActivities');
    localStorage.removeItem('sb-activities-fetch-time');
    sessionStorage.removeItem('activities-cache');
    
    return true;
  };

  return {
    handlePlayerUpdateWrapper,
    handleBulkPlayerUpdateWrapper,
    handleAddPlayerWrapper,
    setViewModeWrapper,
    handleKioskUpdateWrapper,
    handleImportActivitiesWrapper,
    handleClearHistoricalWrapper,
    handleMatchResultWrapper,
    handleRefresh
  };
}
