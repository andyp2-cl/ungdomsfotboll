
import { usePlayerState } from "./usePlayerState";
import { usePlayerFilters } from "./usePlayerFilters";
import { usePlayerActions } from "./usePlayerActions";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const isMobile = useIsMobile();

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
    handleGradeChange: (grade: any) => {
      const isSelected = handleGradeChange(grade);
      setSelectedGrades(prev => 
        isSelected 
          ? prev.filter(g => g !== grade)
          : [...prev, grade]
      );
    },
    handlePositionChange: (position: any) => {
      const isSelected = handlePositionChange(position);
      setSelectedPositions(prev => 
        isSelected 
          ? prev.filter(p => p !== position)
          : [...prev, position]
      );
    },
    handlePlayerUpdate,
    handleBulkPlayerUpdate,
    handleAddPlayer,
    isMobile: isMobile
  };
}
