
import { usePlayerState } from "./usePlayerState";
import { usePlayerFilters } from "./usePlayerFilters";
import { usePlayerActions } from "./usePlayerActions";
import { useState, useEffect } from 'react';

export function usePlayers(initialTab?: string) {
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

  // This is a mock implementation for the PlayersPage.tsx requirements
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filteredHistoricalActivities, setFilteredHistoricalActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState([]);

  // Mock functions to satisfy the PlayersPage.tsx requirements
  const handleActivityTypeChange = () => {};
  const handleActivityUpdate = () => {};
  const handleKioskUpdate = () => {};
  const handleDelete = () => {};
  const handleImportActivities = () => {};
  const handleClearHistorical = () => {};
  const handleAddActivity = () => {};
  const handlePlayerActivitySelect = () => {};
  const handleMatchResult = async () => { return true; };
  const retryLoading = () => {};

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
    // Add these properties to satisfy PlayersPage.tsx requirements
    activities,
    filteredActivities,
    filteredHistoricalActivities,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    selectedActivityTypes,
    handleActivityTypeChange,
    handleActivityUpdate,
    handleKioskUpdate,
    handleDelete,
    handleImportActivities,
    handleClearHistorical,
    handleAddActivity,
    handlePlayerActivitySelect,
    handleMatchResult,
    retryLoading,
    // Set a default for activeTab
    activeTab: initialTab || "players",
    setActiveTab: () => {}
  };
}
