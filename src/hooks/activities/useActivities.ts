
import { Player } from "@/types/player";
import { useActivityState } from './useActivityState';
import { useActivityFilters } from './useActivityFilters';
import { useActivityActions } from './useActivityActions';

export function useActivities(players: Player[], setPlayers: (players: Player[]) => void) {
  // Get basic activity state
  const { 
    activities, 
    setActivities,
    isLoading,
    loadError,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    toast,
    retryLoading
  } = useActivityState();
  
  // Get filtering functionality
  const {
    selectedActivityTypes,
    filteredCurrentActivities,
    filteredHistoricalActivities,
    currentActivities,
    historicalActivities,
    handleActivityTypeChange
  } = useActivityFilters(activities);
  
  // Get activity actions
  const {
    handleActivityUpdate,
    handleDeleteActivity,
    handleKioskAssignmentUpdate,
    handleAddActivity,
    handleImportedActivities,
    handleScrapedMatches,
    handleClearHistoricalActivities,
    handleMatchResultUpdate
  } = useActivityActions(
    activities, 
    setActivities, 
    players, 
    setPlayers, 
    toast,
    currentActivities,
    historicalActivities
  );

  return {
    // State
    activities,
    isLoading,
    loadError,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    
    // Filters
    selectedActivityTypes,
    filteredActivities: filteredCurrentActivities,
    filteredHistoricalActivities,
    handleActivityTypeChange,
    
    // Actions
    handleActivityUpdate,
    handleDeleteActivity,
    handleKioskAssignmentUpdate,
    handleAddActivity,
    handleImportedActivities,
    handleScrapedMatches,
    handleClearHistoricalActivities,
    handleMatchResultUpdate,
    
    // Loading and error handling
    retryLoading
  };
}
