
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PageContainer } from "@/components/page-containers/PageContainer";
import { usePlayers } from "@/hooks/players";
import { useActivities } from "@/hooks/activities";
import { getActiveTab } from "@/utils/storage";
import { MainTabs } from "@/components/tabs/MainTabs";
import { PlayerTabContent } from "@/components/tabs/PlayerTabContent";
import { ActivityTabContent } from "@/components/tabs/ActivityTabContent";
import { PageDialogs } from "@/components/tabs/PageDialogs";
import { Activity } from "@/types/player";
import { BackupRestoreActions } from "@/components/BackupRestoreActions";
import { useEditMode } from "@/contexts/EditModeContext";

interface PlayersPageProps {
  initialTab?: string;
}

export default function PlayersPage({ initialTab }: PlayersPageProps = {}) {
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

  return (
    <PageContainer isLoading={isLoading}>
      <div className="mb-4">
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
              handlePlayerUpdate={canEdit ? handlePlayerUpdate : undefined}
              handleBulkPlayerUpdate={canEdit ? handleBulkPlayerUpdate : undefined}
              setIsAddPlayerOpen={canEdit ? setIsAddPlayerOpen : undefined}
              setEditingPlayer={canEdit ? setEditingPlayer : undefined}
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
              handleActivityUpdate={canEdit ? handleActivityUpdate : undefined}
              setIsAddActivityOpen={canEdit ? setIsAddActivityOpen : undefined}
              setEditingActivity={canEdit ? setEditingActivity : undefined}
              handleKioskAssignmentUpdate={canEdit ? handleKioskUpdate : undefined}
              handleDeleteActivity={canEdit ? handleDelete : undefined}
              handleImportedActivities={canEdit ? handleImportActivities : undefined}
              handleScrapedMatches={canEdit ? handleScraped : undefined}
              handleClearHistoricalActivities={canEdit ? handleClearHistorical : undefined}
            />
          }
        />
      </div>

      {canEdit && (
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
      )}
      
      {/* Backup/Restore actions visible only in edit mode */}
      {canEdit && (
        <div className="fixed bottom-4 right-4 z-10">
          <BackupRestoreActions />
        </div>
      )}
    </PageContainer>
  );
}
