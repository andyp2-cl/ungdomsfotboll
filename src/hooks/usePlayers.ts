
import { useMemo } from "react";
import { usePlayerState } from "@/hooks/players/usePlayerState";
import { usePlayerFilters } from "@/hooks/players/usePlayerFilters";
import { usePlayerActions } from "@/hooks/players/usePlayerActions";
import { Player } from "@/types/player";

/**
 * Combines player state, filtering, and actions into one hook
 */
export function usePlayers(initialTab?: string) {
  // Get player state
  const playerState = usePlayerState();
  const { players, isLoading } = playerState;
  
  // Get player filters with default values
  const playerFilters = usePlayerFilters({
    players,
    searchQuery: "",
    selectedPositions: [],
    selectedGrades: []
  });
  
  // Get player actions with updated player state
  const playerActions = usePlayerActions(playerState);
  
  // Return mock data for properties expected by PlayersPage
  const mockProperties = useMemo(() => ({
    searchTerm: "",
    setSearchTerm: (term: string) => console.log("Search term set to", term),
    sortBy: "name",
    setSortBy: (sort: string) => console.log("Sort by set to", sort),
    sortDirection: "asc",
    setSortDirection: (dir: string) => console.log("Sort direction set to", dir),
    filterActiveStatus: "all",
    setFilterActiveStatus: (status: string) => console.log("Active status set to", status),
    handlePlayerDelete: async (id: string) => {
      console.log("Delete player", id);
      return true;
    },
    handleImageUpdate: async (playerId: string, imageData: string) => {
      console.log("Update image for player", playerId);
      return true;
    },
    handleImportedPlayers: async (players: Player[]) => {
      console.log("Import players", players);
      return true;
    },
    handleClearHistoricalPlayers: async () => {
      console.log("Clear historical players");
      return true;
    },
    // Add activities array for PlayerDetail
    activities: []
  }), []);
  
  // Combine all player state, filters and actions
  return {
    ...playerState,
    ...playerFilters,
    ...playerActions,
    ...mockProperties,
    // Add any tab management needed for PlayerManagementPage
    activeTab: initialTab || "players",
    setActiveTab: (tab: string) => {
      // This is just a placeholder since we don't have actual implementation
      console.log("Setting active tab to", tab);
    }
  };
}
