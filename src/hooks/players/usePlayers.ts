
import { useState } from "react";
import { Player, PlayerGrade, PlayerPosition } from "@/types/player";

export function usePlayerState() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<PlayerGrade[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<PlayerPosition[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "stats">("list");

  return {
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
  };
}

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
    isMobile: false
  };
}
