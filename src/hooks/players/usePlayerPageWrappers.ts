
import { Activity, Player } from "@/types/player";

/**
 * A hook to provide wrapper functions for the PlayersPage
 * that handle type conversions and error handling
 */
export function usePlayerPageWrappers(
  handlePlayerUpdate: (player: Player) => Promise<boolean>,
  handleBulkPlayerUpdate: (players: Player[]) => Promise<boolean>,
  handleAddPlayer: (player: Player) => Promise<boolean>,
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>,
  handleImportActivities: (activities: Activity[]) => Promise<boolean>,
  handleClearHistorical: () => Promise<boolean>,
  handleMatchResult: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>,
  setViewMode: (mode: "list" | "grid" | "stats") => void
) {
  // Converting Promise<boolean> to Promise<void> for player update functions
  const handlePlayerUpdateWrapper = async (player: Player): Promise<void> => {
    await handlePlayerUpdate(player);
  };
  
  const handleBulkPlayerUpdateWrapper = async (players: Player[]): Promise<void> => {
    await handleBulkPlayerUpdate(players);
  };
  
  const handleAddPlayerWrapper = async (player: Player): Promise<void> => {
    await handleAddPlayer(player);
  };

  // Create a wrapper for setViewMode to match expected (mode: string) => void signature
  const setViewModeWrapper = (mode: string): void => {
    if (mode === "grid" || mode === "list" || mode === "stats") {
      setViewMode(mode);
    }
  };

  // Handle refresh - force reload of players and activities data
  const handleRefresh = async (): Promise<void> => {
    try {
      // Reload data (typically would call API endpoints here)
      console.log("Refreshing data...");
      // We'll trigger the refresh without passing specific data
      // Using undefined instead of empty objects as parameters
      await Promise.all([
        handlePlayerUpdate(undefined as any), 
        handleKioskUpdate(undefined as any)
      ]);
      return Promise.resolve();
    } catch (error) {
      console.error("Error refreshing data:", error);
      return Promise.reject(error);
    }
  };

  return {
    handlePlayerUpdateWrapper,
    handleBulkPlayerUpdateWrapper,
    handleAddPlayerWrapper,
    setViewModeWrapper,
    handleRefresh
  };
}
