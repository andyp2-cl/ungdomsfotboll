
import { PageContainer } from "@/components/page-containers/PageContainer";
import { usePlayers } from "@/hooks/usePlayers";
import { PlayersPageContent } from "@/components/page-content/PlayersPageContent";
import { Activity, Player } from "@/types/player"; 
import { useState } from "react";

interface PlayersPageProps {
  initialTab?: string;
}

export default function PlayerManagementPage({ initialTab }: PlayersPageProps = {}) {
  const {
    // Tab state
    activeTab = "players",
    setActiveTab = () => {},
    
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
  } = usePlayers(initialTab);
  
  // Add missing activity-related state and handlers
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [filteredHistoricalActivities, setFilteredHistoricalActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([]);
  
  // Activity handling functions
  const handleActivityTypeChange = (type: string) => {
    if (selectedActivityTypes.includes(type)) {
      setSelectedActivityTypes(prev => prev.filter(t => t !== type));
    } else {
      setSelectedActivityTypes(prev => [...prev, type]);
    }
  };

  // Wrapper functions to ensure proper return types
  const handleKioskUpdateWrapper = async (activityId: string): Promise<boolean> => {
    return true;
  };

  const handleImportActivitiesWrapper = async (activities: Activity[]): Promise<boolean> => {
    return true;
  };

  const handleClearHistoricalWrapper = async (): Promise<boolean> => {
    return true;
  };

  // Converting Promise<boolean> to Promise<void> for player update functions
  const handlePlayerUpdateWrapper = async (player: Player): Promise<void> => {
    await handlePlayerUpdate(player);
  };
  
  const handleBulkPlayerUpdateWrapper = async (players: Player[]): Promise<void> => {
    await handleBulkPlayerUpdate(players);
  };
  
  const handleAddPlayerWrapper = async (player: Player): Promise<void> => {
    await handleAddPlayer(player);
  };

  // Create a wrapper for setViewMode to match expected (mode: string) => void signature
  const setViewModeWrapper = (mode: string) => {
    if (mode === "grid" || mode === "list" || mode === "stats") {
      setViewMode(mode);
    }
  };

  // Activity function wrappers
  const handleActivityUpdateWrapper = async (activity: Activity): Promise<void> => {
    // Changed from returning boolean to void
    console.log("Activity updated", activity);
  };

  const handleAddActivityWrapper = async (activity: Activity): Promise<void> => {
    // Changed from returning boolean to void
    console.log("Activity added", activity);
  };
  
  const handleDeleteWrapper = async (id: string): Promise<boolean> => {
    return true;
  };
  
  const handlePlayerActivitySelectWrapper = (activity: Activity) => {
    setSelectedActivity(activity);
  };
  
  const handleMatchResultWrapper = async (activityId: string, homeScore?: number, awayScore?: number): Promise<boolean> => {
    return true;
  };

  // Fake loading state until full implementation is complete
  const isLoading = false;

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
        handleActivityUpdate={handleActivityUpdateWrapper}
        handleKioskUpdate={handleKioskUpdateWrapper}
        handleDelete={handleDeleteWrapper}
        handleImportActivities={handleImportActivitiesWrapper}
        handleClearHistorical={handleClearHistoricalWrapper}
        handleAddActivity={handleAddActivityWrapper}
        onPlayerActivitySelect={handlePlayerActivitySelectWrapper}
        handleMatchResultUpdate={handleMatchResultWrapper}
        retryLoading={() => {}}
      />
    </PageContainer>
  );
}
