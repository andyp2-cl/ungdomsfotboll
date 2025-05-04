
import { RefreshablePageContainer } from "@/components/page-containers/RefreshablePageContainer";
import { usePlayers } from "@/hooks/usePlayers";
import { PlayersPageContent } from "@/components/page-content/PlayersPageContent";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { usePlayerPageWrappers } from "@/hooks/players/usePlayerPageWrappers";

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
  } = usePlayerPageWrappers({
    handlePlayerUpdate,
    handleBulkPlayerUpdate,
    handleAddPlayer,
    handleKioskUpdate,
    handleImportActivities,
    handleClearHistorical,
    handleMatchResult,
    setViewMode
  });

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

  // Wrapper for handleDelete to match expected handleDeleteActivity
  const handleDeleteActivity = handleDelete;

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
