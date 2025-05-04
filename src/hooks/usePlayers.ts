
import { Player } from "@/types/player";
import { usePlayerState } from '@/hooks/players/usePlayerState';
import { usePlayerFilters } from '@/hooks/players/usePlayerFilters';
import { usePlayerActions } from '@/hooks/players/usePlayerActions';

export function usePlayers(initialPlayers: Player[] = []) {
  // Get basic player state
  const { 
    players, 
    setPlayers,
    isLoading,
    loadError,
    selectedPlayer,
    setSelectedPlayer,
    editingPlayer,
    setEditingPlayer,
    isAddPlayerOpen,
    setIsAddPlayerOpen,
    toast,
    retryLoading
  } = usePlayerState(initialPlayers);
  
  // Get filtering functionality
  const {
    searchTerm,
    setSearchTerm,
    selectedPositions,
    setSelectedPositions, 
    selectedGrades,
    setSelectedGrades,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    filteredPlayers,
    filterActiveStatus,
    setFilterActiveStatus
  } = usePlayerFilters(players);
  
  // Get player actions
  const {
    handlePlayerUpdate,
    handlePlayerDelete,
    handleAddPlayer,
    handleImageUpdate,
    handleImportedPlayers,
    handleClearHistoricalPlayers
  } = usePlayerActions(players, setPlayers, toast);

  return {
    // State
    players,
    isLoading,
    loadError,
    selectedPlayer,
    setSelectedPlayer,
    editingPlayer,
    setEditingPlayer,
    isAddPlayerOpen,
    setIsAddPlayerOpen,
    
    // Filters
    searchTerm,
    setSearchTerm,
    selectedPositions,
    setSelectedPositions,
    selectedGrades,
    setSelectedGrades,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    filterActiveStatus,
    setFilterActiveStatus,
    
    // Computed
    filteredPlayers,
    
    // Actions
    handlePlayerUpdate,
    handlePlayerDelete,
    handleAddPlayer,
    handleImageUpdate,
    handleImportedPlayers,
    handleClearHistoricalPlayers,
    
    // Loading and error handling
    retryLoading
  };
}
