
import { usePlayerState } from "./usePlayerState";
import { usePlayerFilters } from "./usePlayerFilters";
import { usePlayerActions } from "./usePlayerActions";

export function usePlayers() {
  const state = usePlayerState();
  const {
    players,
    setPlayers,
    isLoading,
    setIsLoading,
    searchQuery,
    setSearchQuery,
    selectedGrades,
    setSelectedGrades,
    selectedPositions,
    setSelectedPositions,
    selectedPlayer,
    setSelectedPlayer,
    editingPlayer,
    setEditingPlayer,
    isAddPlayerOpen,
    setIsAddPlayerOpen,
    viewMode,
    setViewMode
  } = state;

  const { filteredPlayers, handleGradeChange, handlePositionChange } = usePlayerFilters({
    players,
    searchQuery,
    selectedGrades,
    selectedPositions
  });

  const { handlePlayerUpdate, handleBulkPlayerUpdate, handleAddPlayer } = usePlayerActions(
    players,
    setPlayers,
    setIsLoading,
    setSelectedPlayer,
    setIsAddPlayerOpen
  );

  return {
    players,
    setPlayers,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedGrades,
    selectedPositions,
    setSelectedPositions,
    selectedPlayer,
    setSelectedPlayer,
    editingPlayer,
    setEditingPlayer,
    isAddPlayerOpen,
    setIsAddPlayerOpen,
    viewMode,
    setViewMode,
    filteredPlayers,
    handleGradeChange,
    handlePositionChange,
    handlePlayerUpdate,
    handleBulkPlayerUpdate,
    handleAddPlayer,
    isMobile: false
  };
}
