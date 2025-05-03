import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Player, Activity, PlayerGrade } from "@/types/player";
import { getActiveTab } from "@/utils/storage";
import { usePlayers as usePlayersData } from "@/hooks/players";
import { useActivities } from "@/hooks/activities";

export function usePlayers(initialTab?: string) {
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
    handleAddPlayer,
    isMobile
  } = usePlayersData();

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
    handleActivityUpdate,
    handleDeleteActivity,
    handleKioskAssignmentUpdate,
    handleAddActivity,
    handleImportedActivities,
    handleClearHistoricalActivities,
    handleMatchResultUpdate,
    retryLoading  // Include retryLoading from useActivities
  } = useActivities(players, setPlayers);

  // Wrapper for activity update
  const handleActivityUpdateWrapper = async (activity: Activity): Promise<void> => {
    try {
      await handleActivityUpdate(activity);
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };

  // Wrapper functions to ensure proper return types
  const handleKioskUpdate = async (activityId: string, playerId?: string): Promise<boolean> => {
    try {
      await handleKioskAssignmentUpdate(activityId, playerId);
      return true;
    } catch (error) {
      console.error("Error updating kiosk assignment:", error);
      return false;
    }
  };

  const handleDelete = async (activityId: string): Promise<boolean> => {
    try {
      return await handleDeleteActivity(activityId);
    } catch (error) {
      console.error("Error deleting activity:", error);
      return false;
    }
  };

  // Wrapper for match result update - changed to return boolean to match expected type
  const handleMatchResult = async (
    activityId: string, 
    homeScore?: number, 
    awayScore?: number
  ): Promise<boolean> => {
    try {
      const success = await handleMatchResultUpdate(
        activities,
        setActivities,
        activityId,
        homeScore,
        awayScore
      );
      
      return success;
    } catch (error) {
      console.error("Error in handleMatchResult:", error);
      return false;
    }
  };

  // Handle imported activities
  const handleImportActivities = async (activities: Activity[]): Promise<boolean> => {
    try {
      await handleImportedActivities(activities);
      return true;
    } catch (error) {
      console.error("Error importing activities:", error);
      return false;
    }
  };

  const handleClearHistorical = async (): Promise<boolean> => {
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

  return {
    // Tab state
    activeTab,
    setActiveTab,
    
    // Player data
    players,
    filteredPlayers,
    selectedPlayer,
    setSelectedPlayer,
    editingPlayer,
    setEditingPlayer,
    isAddPlayerOpen,
    setIsAddPlayerOpen,
    searchQuery,
    setSearchQuery,
    selectedGrades,
    viewMode,
    setViewMode,
    handleGradeChange,
    handlePlayerUpdate,
    handleBulkPlayerUpdate,
    handleAddPlayer,
    isMobile,
    
    // Activity data
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
    handleActivityUpdate: handleActivityUpdateWrapper, // Now properly returns Promise<void>
    handleKioskUpdate,
    handleDelete,
    handleImportActivities,
    handleClearHistorical,
    handleAddActivity,
    handlePlayerActivitySelect,
    handleMatchResult,
    
    // Loading state
    isLoading,
    retryLoading  // Add retryLoading to the returned object
  };
}
