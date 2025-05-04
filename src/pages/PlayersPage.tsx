
import { RefreshablePageContainer } from "@/components/page-containers/RefreshablePageContainer";
import { usePlayers } from "@/hooks/usePlayers";
import { PlayersPageContent } from "@/components/page-content/PlayersPageContent";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { usePlayerPageWrappers } from "@/hooks/players/usePlayerPageWrappers";
import { Player, Activity } from "@/types/player";

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

  // Get wrapper functions from our custom hook
  const {
    handlePlayerUpdateWrapper,
    handleBulkPlayerUpdateWrapper,
    handleAddPlayerWrapper,
    setViewModeWrapper,
    handleKioskUpdateWrapper,
    handleImportActivitiesWrapper,
    handleClearHistoricalWrapper,
    handleMatchResultWrapper,
    handleRefresh
  } = usePlayerPageWrappers(
    handlePlayerUpdate,
    handleBulkPlayerUpdate,
    handleAddPlayer,
    handleKioskUpdate,
    handleImportActivities,
    handleClearHistorical,
    handleMatchResult,
    setViewMode
  );

  // Check for selected activity in location state
  useEffect(() => {
    if (location.state?.selectedActivityId) {
      console.log("Found selectedActivityId in location state:", location.state.selectedActivityId);
      const activity = activities.find((a: any) => a.id === location.state.selectedActivityId);
      if (activity) {
        console.log("Setting selected activity:", activity.name);
        setSelectedActivity(activity);
      }
    }
  }, [location.state, activities, setSelectedActivity]);

  // Wrapper for handleDelete to match expected handleDeleteActivity
  const handleDeleteActivity = handleDelete;

  // Convert handleMatchResultWrapper to return Promise<boolean>
  const handleMatchResultFunc = async (activityId: string, homeScore?: number, awayScore?: number): Promise<boolean> => {
    await handleMatchResultWrapper(activityId, homeScore, awayScore);
    return true; // Return true to match expected return type
  };

  // Convert activity handlers to match expected types
  const handleActivityUpdateFunction = async (activity: Activity): Promise<void> => {
    await handleActivityUpdate();
  };

  const handleAddActivityFunction = async (activity: Activity): Promise<void> => {
    await handleAddActivity();
  };

  // Convert kioskUpdate to match expected types
  const handleKioskUpdateFunction = async (activityId: string): Promise<boolean> => {
    await handleKioskUpdateWrapper(activityId);
    return true;
  };

  // Convert handleBulkPlayerUpdateWrapper to match expected signature
  const handleBulkPlayerUpdateFunction = async (players: Player[]): Promise<void> => {
    await handleBulkPlayerUpdateWrapper(players);
  };

  console.log("PlayersPage rendering with:", {
    activitiesCount: activities.length,
    playersCount: players.length,
    tab: activeTab
  });

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
        handleBulkPlayerUpdate={handleBulkPlayerUpdateFunction}
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
        handleActivityUpdate={handleActivityUpdateFunction}
        handleKioskUpdate={handleKioskUpdateFunction}
        handleDelete={handleDeleteActivity}
        handleImportActivities={handleImportActivitiesWrapper}
        handleClearHistorical={handleClearHistoricalWrapper}
        handleAddActivity={handleAddActivityFunction}
        onPlayerActivitySelect={handlePlayerActivitySelect}
        handleMatchResultUpdate={handleMatchResultFunc}
        
        // Loading state
        isLoading={isLoading}
        retryLoading={retryLoading}
      />
    </RefreshablePageContainer>
  );
}
