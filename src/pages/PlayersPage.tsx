
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
import { Activity } from "@/types/player";

interface PlayersPageProps {
  initialTab?: string;
}

export default function PlayersPage({ initialTab }: PlayersPageProps = {}) {
  const location = useLocation();
  const pathTab = location.pathname === "/activities" ? "activities" : "players";
  const storedTab = getActiveTab();
  const [activeTab, setActiveTab] = useState(pathTab || initialTab || storedTab);
  
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

  const handleImportActivities = async (activities: Activity[]): Promise<boolean> => {
    try {
      await handleImportedActivities(activities);
      return true;
    } catch (error) {
      console.error("Error importing activities:", error);
      return false;
    }
  };

  const handleScraped = async (matches: Activity[]): Promise<boolean> => {
    try {
      await handleScrapedMatches(matches);
      return true;
    } catch (error) {
      console.error("Error handling scraped matches:", error);
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

  if (isLoading) {
    return (
      <div className="container py-6">
        <PlayerHeader />
        <LoadingState />
      </div>
    );
  }

  const handlePlayerActivitySelect = (activity: Activity) => {
    setSelectedPlayer(null);
    setSelectedActivity(activity);
    setActiveTab('activities');
  };

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
            onActivitySelect={handlePlayerActivitySelect}
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
