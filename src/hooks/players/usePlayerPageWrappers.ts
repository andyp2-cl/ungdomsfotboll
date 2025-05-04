
import { Activity, Player } from "@/types/player";

interface UsePlayerPageWrappersProps {
  handlePlayerUpdate: (player: Player) => Promise<void>;
  handleBulkPlayerUpdate: (players: Player[]) => Promise<void>;
  handleAddPlayer: (player: Player) => Promise<void>;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleImportActivities: (activities: Activity[]) => Promise<boolean>;
  handleClearHistorical: () => Promise<boolean>;
  handleMatchResult: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
  setViewMode: (mode: 'list' | 'cards') => void;
}

export function usePlayerPageWrappers({
  handlePlayerUpdate,
  handleBulkPlayerUpdate,
  handleAddPlayer,
  handleKioskUpdate,
  handleImportActivities,
  handleClearHistorical,
  handleMatchResult,
  setViewMode
}: UsePlayerPageWrappersProps) {
  // Simple wrappers around the handler functions
  const handlePlayerUpdateWrapper = async (player: Player) => {
    await handlePlayerUpdate(player);
  };
  
  const handleBulkPlayerUpdateWrapper = async (players: Player[]) => {
    await handleBulkPlayerUpdate(players);
  };
  
  const handleAddPlayerWrapper = async (player: Player) => {
    await handleAddPlayer(player);
  };
  
  const handleKioskUpdateWrapper = async (activityId: string, playerId?: string): Promise<boolean> => {
    return await handleKioskUpdate(activityId, playerId);
  };
  
  const handleImportActivitiesWrapper = async (activities: Activity[]): Promise<boolean> => {
    return await handleImportActivities(activities);
  };
  
  const handleClearHistoricalWrapper = async (): Promise<boolean> => {
    return await handleClearHistorical();
  };
  
  const handleMatchResultWrapper = async (activityId: string, homeScore?: number, awayScore?: number): Promise<boolean> => {
    return await handleMatchResult(activityId, homeScore, awayScore);
  };
  
  const setViewModeWrapper = (mode: 'list' | 'cards') => {
    setViewMode(mode);
  };
  
  const handleRefresh = () => {
    // Clear caches to force a refresh
    localStorage.removeItem('cachedActivities');
    localStorage.removeItem('sb-activities-fetch-time');
    window.location.reload();
  };

  return {
    handlePlayerUpdateWrapper,
    handleBulkPlayerUpdateWrapper,
    handleAddPlayerWrapper,
    handleKioskUpdateWrapper,
    handleImportActivitiesWrapper,
    handleClearHistoricalWrapper,
    handleMatchResultWrapper,
    setViewModeWrapper,
    handleRefresh
  };
}
