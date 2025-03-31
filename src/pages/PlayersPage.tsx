
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PlayerHeader } from "@/components/PlayerHeader";
import { LoadingState } from "@/components/LoadingState";
import { usePlayers } from "@/hooks/usePlayers";
import { useActivities } from "@/hooks/activities";
import { getActiveTab } from "@/utils/storage";
import { MainTabs } from "@/components/tabs/MainTabs";
import { PlayerTabContent } from "@/components/tabs/PlayerTabContent";
import { ActivityTabContent } from "@/components/tabs/ActivityTabContent";
import { PageDialogs } from "@/components/tabs/PageDialogs";

interface PlayersPageProps {
  initialTab?: string;
}

export default function PlayersPage({ initialTab }: PlayersPageProps = {}) {
  const location = useLocation();
  const pathTab = location.pathname === "/activities" ? "activities" : "players";
  const storedTab = getActiveTab();
  const [activeTab, setActiveTab] = useState(pathTab || initialTab || storedTab);
  
  // Use custom hooks
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
    handleScrapedMatches,
    handleClearHistoricalActivities
  } = useActivities(players, setPlayers);

  // Modified function wrappers to ensure Promise<boolean> return type
  const handleKioskUpdate = async (activityId: string, playerId?: string): Promise<boolean> => {
    await handleKioskAssignmentUpdate(activityId, playerId);
    return true;
  };

  const handleDelete = async (activityId: string): Promise<boolean> => {
    await handleDeleteActivity(activityId);
    return true;
  };

  const handleImportActivities = async (activities: Activity[]): Promise<boolean> => {
    await handleImportedActivities(activities);
    return true;
  };

  const handleScraped = async (matches: Activity[]): Promise<boolean> => {
    await handleScrapedMatches(matches);
    return true;
  };

  const handleClearHistorical = async (): Promise<boolean> => {
    await handleClearHistoricalActivities();
    return true;
  };

  const isLoading = isPlayersLoading || isActivitiesLoading;

  if (isLoading) {
    return (
      <div className="container py-6">
        <PlayerHeader />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <PlayerHeader />
      
      <MainTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        playersContent={
          <PlayerTabContent 
            players={players}
            activities={activities}
            searchQuery={searchQuery}
            selectedGrades={selectedGrades}
            selectedPlayer={selectedPlayer}
            viewMode={viewMode}
            filteredPlayers={filteredPlayers}
            isAddPlayerOpen={isAddPlayerOpen}
            setSearchQuery={setSearchQuery}
            handleGradeChange={handleGradeChange}
            setSelectedPlayer={setSelectedPlayer}
            setViewMode={setViewMode}
            handlePlayerUpdate={handlePlayerUpdate}
            handleBulkPlayerUpdate={handleBulkPlayerUpdate}
            setIsAddPlayerOpen={setIsAddPlayerOpen}
            setEditingPlayer={setEditingPlayer}
          />
        }
        activitiesContent={
          <ActivityTabContent 
            activities={activities}
            players={players}
            selectedActivity={selectedActivity}
            selectedActivityTypes={selectedActivityTypes}
            filteredActivities={filteredActivities}
            filteredHistoricalActivities={filteredHistoricalActivities}
            isAddActivityOpen={isAddActivityOpen}
            handleActivityTypeChange={handleActivityTypeChange}
            setSelectedActivity={setSelectedActivity}
            handleActivityUpdate={handleActivityUpdate}
            setIsAddActivityOpen={setIsAddActivityOpen}
            setEditingActivity={setEditingActivity}
            handleKioskAssignmentUpdate={handleKioskUpdate}
            handleDeleteActivity={handleDelete}
            handleImportedActivities={handleImportActivities}
            handleScrapedMatches={handleScraped}
            handleClearHistoricalActivities={handleClearHistorical}
          />
        }
      />

      <PageDialogs 
        editingPlayer={editingPlayer}
        editingActivity={editingActivity}
        isAddPlayerOpen={isAddPlayerOpen}
        isAddActivityOpen={isAddActivityOpen}
        setEditingPlayer={setEditingPlayer}
        setEditingActivity={setEditingActivity}
        setIsAddPlayerOpen={setIsAddPlayerOpen}
        setIsAddActivityOpen={setIsAddActivityOpen}
        handlePlayerUpdate={handlePlayerUpdate}
        handleActivityUpdate={handleActivityUpdate}
        handleAddPlayer={handleAddPlayer}
        handleAddActivity={handleAddActivity}
      />
    </div>
  );
}
