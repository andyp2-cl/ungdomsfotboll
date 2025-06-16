import { PageContainer } from "@/components/page-containers/PageContainer";
import { usePlayers } from "@/hooks/usePlayers";
import { PlayersPageContent } from "@/components/page-content/PlayersPageContent";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface PlayersPageProps {
  initialTab?: string;
}

export default function PlayersPage({ initialTab }: PlayersPageProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  // Sätt initial tab från URL-path
  const urlTab = location.pathname.replace("/", "") || "players";
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
    handleDeletePlayer,
    
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
    handlePlayerSelect,
    
    // Loading state
    isLoading
  } = usePlayers(urlTab);

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

  // När tab ändras, navigera till rätt route
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Only navigate for tabs that have a route defined
    const routeTabs = [
      "players", "activities", "statistics", "development", "training", "excel", "team-selection", "cups"
    ];
    if (routeTabs.includes(tabId)) {
      navigate(`/${tabId}`);
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

  const handleDeletePlayerWrapper = async (playerId: string) => {
    await handleDeletePlayer(playerId);
  };

  // Create a wrapper for setViewMode to handle type conversion
  const setViewModeWrapper = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  return (
    <PageContainer isLoading={isLoading}>
      <PlayersPageContent 
        // Tab state
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        
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
        viewMode={viewMode === "stats" ? "list" : viewMode as "grid" | "list"}
        setViewMode={setViewModeWrapper}
        handleGradeChange={handleGradeChange}
        handlePlayerUpdate={handlePlayerUpdateWrapper}
        handleBulkPlayerUpdate={handleBulkPlayerUpdateWrapper}
        handleAddPlayer={handleAddPlayerWrapper}
        handleDeletePlayer={handleDeletePlayerWrapper}
        
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
        handleKioskUpdate={handleKioskUpdate}
        handleDelete={handleDelete}
        handleImportActivities={handleImportActivities}
        handleClearHistorical={handleClearHistorical}
        handleAddActivity={handleAddActivity}
        onPlayerActivitySelect={async (activity) => {
          await handlePlayerActivitySelect(activity);
        }}
        handleMatchResultUpdate={handleMatchResult}
        onPlayerSelect={handlePlayerSelect}
      />
    </PageContainer>
  );
}
