
import React from "react";
import { Player, Activity, PlayerGrade, ActivityType } from "@/types/player";
import { MainTabs } from "@/components/tabs/MainTabs";
import { PlayerTabContent } from "@/components/tabs/PlayerTabContent";
import { ActivityTabContent } from "@/components/tabs/ActivityTabContent";
import { PageDialogs } from "@/components/tabs/PageDialogs";

interface PlayersPageContentProps {
  // Tab state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Player data
  players: Player[];
  activities: Activity[];
  filteredPlayers: Player[];
  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;
  editingPlayer: Player | null;
  setEditingPlayer: (player: Player | null) => void;
  isAddPlayerOpen: boolean;
  setIsAddPlayerOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGrades: PlayerGrade[];
  viewMode: "list" | "grid" | "stats";
  setViewMode: (mode: "list" | "grid" | "stats") => void;
  handleGradeChange: (grade: PlayerGrade) => void;
  handlePlayerUpdate: (player: Player) => void;
  handleBulkPlayerUpdate: (players: Player[]) => void;
  handleAddPlayer: (player: Player) => void;
  
  // Activity data
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  selectedActivity: Activity | null;
  setSelectedActivity: (activity: Activity | null) => void;
  editingActivity: Activity | null;
  setEditingActivity: (activity: Activity | null) => void;
  isAddActivityOpen: boolean;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  selectedActivityTypes: ActivityType[];
  handleActivityTypeChange: (type: ActivityType) => void;
  handleActivityUpdate: (activity: Activity) => void;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDelete: (activityId: string) => Promise<boolean>;
  handleImportActivities: (activities: Activity[]) => Promise<boolean>;
  handleScraped: (matches: Activity[]) => Promise<boolean>;
  handleClearHistorical: () => Promise<boolean>;
  handleAddActivity: (activity: Activity) => void;
  onPlayerActivitySelect: (activity: Activity) => void;
}

export function PlayersPageContent({
  // Tab state
  activeTab,
  setActiveTab,
  
  // Player data
  players,
  activities,
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
  handleScraped,
  handleClearHistorical,
  handleAddActivity,
  onPlayerActivitySelect
}: PlayersPageContentProps) {
  return (
    <>
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
              handlePlayerUpdate={handlePlayerUpdate}
              handleBulkPlayerUpdate={handleBulkPlayerUpdate}
              setIsAddPlayerOpen={setIsAddPlayerOpen}
              setEditingPlayer={setEditingPlayer}
              onActivitySelect={onPlayerActivitySelect}
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
      </div>

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
    </>
  );
}
