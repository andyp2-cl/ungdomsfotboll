import { useState } from "react";
import { useLocation } from "react-router-dom";
import { getActiveTab } from "@/utils/storage";
import { usePlayers } from "@/hooks/players";
import { useActivities } from "@/hooks/activities";
import { useEditMode } from "@/contexts/EditModeContext";
import { Activity, Player } from "@/types/player";

export function usePlayersPageState(initialTab?: string) {
  const { isEditMode } = useEditMode();
  
  // Get tab from location or storage
  const location = useLocation();
  const pathTab = location.pathname === "/activities" ? "activities" : "players";
  const storedTab = getActiveTab();
  const [activeTab, setActiveTab] = useState(pathTab || initialTab || storedTab);
  
  // Get player state and actions
  const {
    players,
    setPlayers,
    isLoading: isPlayersLoading,
    searchQuery,
    setSearchQuery,
    selectedGrades,
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
    handlePlayerUpdate,
    handleBulkPlayerUpdate,
    handleAddPlayer
  } = usePlayers();

  // Get activity state and actions
  const {
    activities,
    isLoading: isActivitiesLoading,
    selectedActivityTypes,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    filteredActivities,
    filteredHistoricalActivities,
    handleActivityTypeChange,
    handleActivityUpdate: originalHandleActivityUpdate,
    handleDeleteActivity,
    handleKioskAssignmentUpdate,
    handleAddActivity: originalHandleAddActivity,
    handleImportedActivities,
    handleScrapedMatches,
    handleClearHistoricalActivities
  } = useActivities(players, setPlayers);

  // Wrapper functions with proper return type handling
  const handleActivityUpdate = async (activity: Activity): Promise<boolean> => {
    if (!isEditMode) return false;
    
    try {
      await originalHandleActivityUpdate(activity);
      return true;
    } catch (error) {
      console.error("Error updating activity:", error);
      return false;
    }
  };
  
  const handleAddActivity = async (activity: Activity): Promise<boolean> => {
    if (!isEditMode) return false;
    
    try {
      await originalHandleAddActivity(activity);
      return true;
    } catch (error) {
      console.error("Error adding activity:", error);
      return false;
    }
  };

  const handleKioskUpdate = async (activityId: string, playerId?: string): Promise<boolean> => {
    if (!isEditMode) return false;
    
    try {
      await handleKioskAssignmentUpdate(activityId, playerId);
      return true;
    } catch (error) {
      console.error("Error updating kiosk assignment:", error);
      return false;
    }
  };

  const handleDelete = async (activityId: string): Promise<boolean> => {
    if (!isEditMode) return false;
    
    try {
      return await handleDeleteActivity(activityId);
    } catch (error) {
      console.error("Error deleting activity:", error);
      return false;
    }
  };

  // Handle imported or scraped activities
  const handleImportActivities = async (activities: Activity[]): Promise<boolean> => {
    if (!isEditMode) return false;
    
    try {
      await handleImportedActivities(activities);
      return true;
    } catch (error) {
      console.error("Error importing activities:", error);
      return false;
    }
  };

  const handleScraped = async (matches: Activity[]): Promise<boolean> => {
    if (!isEditMode) return false;
    
    try {
      await handleScrapedMatches(matches);
      return true;
    } catch (error) {
      console.error("Error handling scraped matches:", error);
      return false;
    }
  };

  const handleClearHistorical = async (): Promise<boolean> => {
    if (!isEditMode) return false;
    
    try {
      await handleClearHistoricalActivities();
      return true;
    } catch (error) {
      console.error("Error clearing historical activities:", error);
      return false;
    }
  };

  const isLoading = isPlayersLoading || isActivitiesLoading;

  // Handle selection of activity from player detail view
  const handlePlayerActivitySelect = (activity: Activity) => {
    setSelectedPlayer(null);
    setSelectedActivity(activity);
    setActiveTab('activities');
  };

  // Use this to conditionally render edit UI elements
  const canEdit = isEditMode;

  return {
    // Tab state
    activeTab,
    setActiveTab,
    
    // Edit mode
    canEdit,
    
    // Loading state
    isLoading,
    
    // Players state
    players,
    searchQuery,
    selectedGrades,
    selectedPlayer,
    editingPlayer,
    isAddPlayerOpen,
    viewMode,
    filteredPlayers,
    
    // Activities state
    activities,
    selectedActivityTypes,
    selectedActivity,
    editingActivity,
    isAddActivityOpen,
    filteredActivities,
    filteredHistoricalActivities,
    
    // Player actions
    setSearchQuery,
    handleGradeChange,
    setSelectedPlayer,
    setEditingPlayer,
    setIsAddPlayerOpen,
    setViewMode,
    handlePlayerUpdate,
    handleBulkPlayerUpdate,
    handleAddPlayer,
    
    // Activity actions
    handleActivityTypeChange,
    setSelectedActivity,
    setEditingActivity,
    setIsAddActivityOpen,
    handleActivityUpdate,
    handleKioskUpdate,
    handleDelete,
    handleImportActivities,
    handleScraped,
    handleClearHistorical,
    handleAddActivity,
    
    // Other actions
    handlePlayerActivitySelect
  };
}
