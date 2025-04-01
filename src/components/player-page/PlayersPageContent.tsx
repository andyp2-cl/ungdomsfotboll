import { useMemo } from "react";
import { MainTabs } from "@/components/tabs/MainTabs";
import { PlayerTabContent } from "@/components/tabs/PlayerTabContent";
import { ActivityTabContent } from "@/components/tabs/ActivityTabContent";
import { PageDialogs } from "@/components/tabs/PageDialogs";
import { Player, Activity } from "@/types/player";

interface PlayersPageContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  players: Player[];
  activities: Activity[];
  searchQuery: string;
  selectedGrades: any[];
  selectedPlayer: Player | null;
  viewMode: "list" | "grid" | "stats";
  filteredPlayers: Player[];
  isAddPlayerOpen: boolean;
  isAddActivityOpen: boolean;
  isLoading: boolean;
  selectedActivity: Activity | null;
  selectedActivityTypes: any[];
  editingPlayer: Player | null;
  editingActivity: Activity | null;
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  canEdit: boolean;
  // Player actions
  setSearchQuery: (query: string) => void;
  handleGradeChange: (grade: any) => void;
  setSelectedPlayer: (player: Player | null) => void;
  setViewMode: (mode: "list" | "grid" | "stats") => void;
  handlePlayerUpdate: ((player: Player) => Promise<boolean>) | undefined;
  handleBulkPlayerUpdate: ((players: Player[]) => Promise<boolean>) | undefined;
  setIsAddPlayerOpen: ((isOpen: boolean) => void) | undefined;
  setEditingPlayer: ((player: Player | null) => void) | undefined;
  // Activity actions
  handleActivityTypeChange: (type: any) => void;
  setSelectedActivity: (activity: Activity | null) => void;
  handleActivityUpdate: ((activity: Activity) => Promise<boolean>) | undefined;
  setIsAddActivityOpen: ((isOpen: boolean) => void) | undefined;
  setEditingActivity: ((activity: Activity | null) => void) | undefined;
  handleKioskUpdate: ((activityId: string, playerId?: string) => Promise<boolean>) | undefined;
  handleDelete: ((activityId: string) => Promise<boolean>) | undefined;
  handleImportActivities: ((activities: Activity[]) => Promise<boolean>) | undefined;
  handleScraped: ((matches: Activity[]) => Promise<boolean>) | undefined;
  handleClearHistorical: (() => Promise<boolean>) | undefined;
  // Other actions
  handlePlayerActivitySelect: (activity: Activity) => void;
  handleAddPlayer: (player: Player) => Promise<boolean>;
  handleAddActivity: (activity: Activity) => Promise<boolean>;
}

export function PlayersPageContent({
  activeTab,
  setActiveTab,
  players,
  activities,
  searchQuery,
  selectedGrades,
  selectedPlayer,
  viewMode,
  filteredPlayers,
  isAddPlayerOpen,
  isAddActivityOpen,
  isLoading,
  selectedActivity,
  selectedActivityTypes,
  editingPlayer,
  editingActivity,
  filteredActivities,
  filteredHistoricalActivities,
  canEdit,
  // Player actions
  setSearchQuery,
  handleGradeChange,
  setSelectedPlayer,
  setViewMode,
  handlePlayerUpdate,
  handleBulkPlayerUpdate,
  setIsAddPlayerOpen,
  setEditingPlayer,
  // Activity actions
  handleActivityTypeChange,
  setSelectedActivity,
  handleActivityUpdate,
  setIsAddActivityOpen,
  setEditingActivity,
  handleKioskUpdate,
  handleDelete,
  handleImportActivities,
  handleScraped,
  handleClearHistorical,
  // Other actions
  handlePlayerActivitySelect,
  handleAddPlayer,
  handleAddActivity
}: PlayersPageContentProps) {
  const playerTabContent = useMemo(() => (
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
  ), [
    players, activities, searchQuery, selectedGrades, selectedPlayer, 
    viewMode, filteredPlayers, isAddPlayerOpen, canEdit,
    handlePlayerUpdate, handleBulkPlayerUpdate, handlePlayerActivitySelect
  ]);

  const activityTabContent = useMemo(() => (
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
  ), [
    activities, players, selectedActivity, selectedActivityTypes,
    filteredActivities, filteredHistoricalActivities, isAddActivityOpen, canEdit,
    handleActivityUpdate, handleKioskUpdate, handleDelete, 
    handleImportActivities, handleScraped, handleClearHistorical
  ]);

  return (
    <>
      <div className="mb-4">
        <MainTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          playersContent={playerTabContent}
          activitiesContent={activityTabContent}
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
    </>
  );
}
