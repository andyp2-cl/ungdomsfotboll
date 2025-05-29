
import { PageContainer } from "@/components/page-containers/PageContainer";
import { usePlayers } from "@/hooks/usePlayers";
import { PlayersPageContent } from "@/components/page-content/PlayersPageContent";
import { Activity } from "@/types/player"; // Add missing Activity import

interface PlayersPageProps {
  initialTab?: string;
}

export default function PlayersPage({ initialTab }: PlayersPageProps = {}) {
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
    
    // Loading state
    isLoading
  } = usePlayers(initialTab);

  // Wrapper functions to ensure proper return types
  const handleKioskUpdateWrapper = async (activityId: string, playerId?: string): Promise<boolean> => {
    return await handleKioskUpdate(activityId, playerId);
  };

  const handleImportActivitiesWrapper = async (activities: Activity[]): Promise<boolean> => {
    return await handleImportActivities(activities);
  };

  const handleClearHistoricalWrapper = async (): Promise<boolean> => {
    return await handleClearHistorical();
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

  // Wrapper for handleDeletePlayer
  const handleDeletePlayerWrapper = async (playerId: string) => {
    if (handleDeletePlayer) {
      await handleDeletePlayer(playerId);
    } else {
      console.error("handleDeletePlayer is not implemented");
    }
  };

  // Create a wrapper for setViewMode to match expected (mode: string) => void signature
  const setViewModeWrapper = (mode: string) => {
    if (mode === "grid" || mode === "list") {
      setViewMode(mode);
    }
  };

  // Add wrapper for handleMatchResult to match expected handleMatchResultUpdate
  const handleMatchResultUpdateWrapper = async (activityId: string, homeScore?: number, awayScore?: number): Promise<void> => {
    await handleMatchResult(activityId, homeScore, awayScore);
  };

  // Add wrapper for handlePlayerActivitySelect
  const handlePlayerActivitySelectWrapper = async (activity: Activity): Promise<void> => {
    handlePlayerActivitySelect(activity);
  };

  return (
    <PageContainer isLoading={isLoading}>
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
        handleKioskUpdate={handleKioskUpdateWrapper}
        handleDelete={handleDelete}
        handleImportActivities={handleImportActivitiesWrapper}
        handleClearHistorical={handleClearHistoricalWrapper}
        handleAddActivity={handleAddActivity}
        onPlayerActivitySelect={handlePlayerActivitySelectWrapper}
        handleMatchResultUpdate={handleMatchResultUpdateWrapper}
      />
    </PageContainer>
  );
}
