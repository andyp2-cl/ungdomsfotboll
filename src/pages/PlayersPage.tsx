import { RefreshablePageContainer } from "@/components/page-containers/RefreshablePageContainer";
import { usePlayers } from "@/hooks/usePlayers";
import { PlayersPageContent } from "@/components/page-content/PlayersPageContent";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Activity } from "@/types/player";

interface PlayersPageProps {
  initialTab?: string;
}

export default function PlayersPage({ initialTab }: PlayersPageProps = {}) {
  const location = useLocation();
  const {
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
    handleActivityUpdate,
    handleKioskUpdate,
    handleDelete,
    handleImportActivities,
    handleClearHistorical,
    handleAddActivity,
    handlePlayerActivitySelect,
    handleMatchResult,
    
    // Loading state
    isLoading,
    retryLoading
  } = usePlayers(initialTab);

  // Check for selected activity in location state
  useEffect(() => {
    if (location.state?.selectedActivityId) {
      console.log("Found selectedActivityId in location state:", location.state.selectedActivityId);
      const activity = activities.find(a => a.id === location.state.selectedActivityId);
      if (activity) {
        console.log("Setting selected activity:", activity.name);
        setSelectedActivity(activity);
      }
    }
  }, [location.state, activities, setSelectedActivity]);

  // Handle refresh - force reload of players and activities data
  const handleRefresh = async () => {
    try {
      // Reload data (typically would call API endpoints here)
      console.log("Refreshing data...");
      // We'll trigger the refresh without passing specific data
      // Using undefined instead of empty objects as parameters
      await Promise.all([
        handlePlayerUpdate(undefined as any), 
        handleActivityUpdate(undefined as any)
      ]);
      return Promise.resolve();
    } catch (error) {
      console.error("Error refreshing data:", error);
      return Promise.reject(error);
    }
  };

  // Converting Promise<boolean> to Promise<void> for player update functions
  const handlePlayerUpdateWrapper = async (player: any) => {
    await handlePlayerUpdate(player);
  };
  
  const handleBulkPlayerUpdateWrapper = async (players: any[]) => {
    await handleBulkPlayerUpdate(players);
  };
  
  const handleAddPlayerWrapper = async (player: any) => {
    await handleAddPlayer(player);
  };

  // Create a wrapper for setViewMode to match expected (mode: string) => void signature
  const setViewModeWrapper = (mode: string) => {
    if (mode === "grid" || mode === "list" || mode === "stats") {
      setViewMode(mode);
    }
  };

  // Wrapper for handleDelete to match expected handleDeleteActivity
  const handleDeleteActivity = handleDelete;
  
  // Wrapper for handleKioskUpdate to match expected handleKioskUpdate
  const handleKioskUpdateWrapper = async (activityId: string, playerId?: string): Promise<boolean> => {
    return await handleKioskUpdate(activityId, playerId);
  };
  
  // Wrapper for import activities
  const handleImportActivitiesWrapper = async (activities: Activity[]): Promise<boolean> => {
    return await handleImportActivities(activities);
  };
  
  // Wrapper for clear historical
  const handleClearHistoricalWrapper = async (): Promise<boolean> => {
    return await handleClearHistorical();
  };

  // Wrapper for match result update - fixed to properly handle the Promise<void>
  const handleMatchResultWrapper = async (activityId: string, homeScore?: number, awayScore?: number): Promise<void> => {
    try {
      console.log(`PlayersPage: Calling handleMatchResult with scores=${homeScore}-${awayScore}`);
      
      // Call the function without checking truthiness
      await handleMatchResult(activityId, homeScore, awayScore);
    } catch (error) {
      console.error("Error updating match result:", error);
    }
  };

  return (
    <RefreshablePageContainer isLoading={isLoading} onRefresh={handleRefresh} disabled={!!selectedPlayer || !!selectedActivity}>
      <PlayersPageContent 
        // Tab state
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        
        // Player data
        players={players}
        activities={activities}
        filteredPlayers={filteredPlayers}
        selectedPlayer={selectedPlayer}
        setSelectedPlayer={setSelectedPlayer}
        editingPlayer={editingPlayer}
        setEditingPlayer={setEditingPlayer}
        isAddPlayerOpen={isAddPlayerOpen}
        setIsAddPlayerOpen={setIsAddPlayerOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGrades={selectedGrades}
        viewMode={viewMode}
        setViewMode={setViewModeWrapper}
        handleGradeChange={handleGradeChange}
        handlePlayerUpdate={handlePlayerUpdateWrapper}
        handleBulkPlayerUpdate={handleBulkPlayerUpdateWrapper}
        handleAddPlayer={handleAddPlayerWrapper}
        
        // Activity data
        filteredActivities={filteredActivities}
        filteredHistoricalActivities={filteredHistoricalActivities}
        selectedActivity={selectedActivity}
        setSelectedActivity={setSelectedActivity}
        editingActivity={editingActivity}
        setEditingActivity={setEditingActivity}
        isAddActivityOpen={isAddActivityOpen}
        setIsAddActivityOpen={setIsAddActivityOpen}
        selectedActivityTypes={selectedActivityTypes}
        handleActivityTypeChange={handleActivityTypeChange}
        handleActivityUpdate={handleActivityUpdate}
        handleKioskUpdate={handleKioskUpdateWrapper}
        handleDelete={handleDeleteActivity}
        handleImportActivities={handleImportActivitiesWrapper}
        handleClearHistorical={handleClearHistoricalWrapper}
        handleAddActivity={handleAddActivity}
        onPlayerActivitySelect={handlePlayerActivitySelect}
        handleMatchResultUpdate={handleMatchResultWrapper}
        
        // Loading state
        isLoading={isLoading}
        retryLoading={retryLoading}
      />
    </RefreshablePageContainer>
  );
}
