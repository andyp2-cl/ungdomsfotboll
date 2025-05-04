
import React, { useState } from "react";
import { usePlayers } from "../hooks/usePlayers";
import { useActivities } from "../hooks/activities";
import { Activity } from "@/types/player";
import { DialogModals } from "@/components/DialogModals";
import { LayoutMain } from "@/components/LayoutMain";
import { MainTabs } from "@/components/tabs/MainTabs";
import { PlayerTabContent } from "@/components/tabs/player-tab/PlayerTabContent";
import { ActivityTabContent } from "@/components/tabs/activity-tab";

/**
 * Main players page component with filtering, sorting, and activity management
 */
export default function PlayersPage() {
  const [activeTab, setActiveTab] = useState<string>("players");

  // Use players hook to get player data and actions
  const {
    players,
    isLoading: playersLoading,
    selectedPlayer,
    setSelectedPlayer,
    editingPlayer,
    setEditingPlayer,
    isAddPlayerOpen,
    setIsAddPlayerOpen,
    // Filters
    searchQuery: searchTerm, // Use searchQuery as searchTerm
    setSearchQuery: setSearchTerm, // Map function names
    selectedPositions,
    setSelectedPositions,
    selectedGrades,
    setSelectedGrades,
    // Missing properties from PlayersPage - these will come from the mockProperties in usePlayers
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    filterActiveStatus,
    setFilterActiveStatus,
    // Computed
    filteredPlayers,
    // Actions
    handlePlayerUpdate,
    handleAddPlayer,
    handlePlayerDelete,
    handleImageUpdate,
    handleImportedPlayers,
    handleClearHistoricalPlayers
  } = usePlayers();

  // Use activities hook to get activity data and actions
  const {
    activities,
    isLoading: activitiesLoading,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    // Filters
    selectedActivityTypes,
    filteredActivities,
    filteredHistoricalActivities,
    handleActivityTypeChange,
    // Actions
    handleActivityUpdate,
    handleDeleteActivity,
    handleKioskAssignmentUpdate,
    handleAddActivity,
    handleImportedActivities,
    handleScrapedMatches,
    handleClearHistoricalActivities,
    handleMatchResultUpdate
  } = useActivities(players, () => {});

  // Wrapper functions to handle promises correctly
  const handlePlayerUpdateWrapper = async (player: any) => {
    await handlePlayerUpdate(player);
    return true;
  };

  const handleClearHistoricalWrapper = async () => {
    await handleClearHistoricalPlayers();
    return true;
  };

  // Wrapper for match result update to return boolean as required by prop type
  const handleMatchResultUpdateWrapper = async (
    activityId: string,
    homeScore?: number,
    awayScore?: number
  ): Promise<boolean> => {
    await handleMatchResultUpdate(activityId, homeScore, awayScore);
    return true;
  };

  // Handle imported players and activities
  const handleImport = async (data: any) => {
    if (data.players) {
      await handleImportedPlayers(data.players);
    }
    if (data.activities) {
      await handleImportedActivities(data.activities);
    }
  };

  const isLoading = playersLoading || activitiesLoading;

  return (
    <LayoutMain title="Spelare" isLoading={isLoading}>
      <MainTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        playerCount={filteredPlayers.length}
        activityCount={filteredActivities.length}
        playersContent={
          <PlayerTabContent 
            players={filteredPlayers}
            activities={activities}
            searchQuery={searchTerm}
            selectedGrades={selectedGrades}
            selectedPlayer={selectedPlayer}
            viewMode="list"
            filteredPlayers={filteredPlayers}
            isAddPlayerOpen={isAddPlayerOpen}
            setSearchQuery={setSearchTerm}
            handleGradeChange={(grade) => setSelectedGrades(prev => 
              prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
            )}
            setSelectedPlayer={setSelectedPlayer}
            setViewMode={() => {}}
            handlePlayerUpdate={handlePlayerUpdateWrapper}
            handleBulkPlayerUpdate={async () => {}}
            setIsAddPlayerOpen={setIsAddPlayerOpen}
            setEditingPlayer={setEditingPlayer}
            onActivitySelect={() => {}}
          />
        }
        activitiesContent={
          <ActivityTabContent 
            activities={activities}
            players={players}
            selectedActivity={selectedActivity}
            selectedActivityTypes={selectedActivityTypes}
            filteredActivities={filteredActivities}
            handleActivityTypeChange={handleActivityTypeChange}
            setSelectedActivity={setSelectedActivity}
            handleActivityUpdate={async (activity) => {
              await handleActivityUpdate(activity);
            }}
            onAddActivityClick={() => setIsAddActivityOpen(true)}
            onEditActivityClick={setEditingActivity}
            setEditingActivity={setEditingActivity}
            handleKioskAssignmentUpdate={async (activityId, playerId) => {
              await handleKioskAssignmentUpdate(activityId, playerId);
              return true;
            }}
            handleDeleteActivity={async (activityId) => {
              await handleDeleteActivity(activityId);
              return true;
            }}
            handleMatchResultUpdate={handleMatchResultUpdateWrapper}
            cupMatches={activities.filter(a => a.type === 'cup')}
          />
        }
      />

      <DialogModals 
        editingPlayer={editingPlayer}
        editingActivity={editingActivity}
        isAddPlayerOpen={isAddPlayerOpen}
        isAddActivityOpen={isAddActivityOpen}
        onEditingPlayerChange={setEditingPlayer}
        onEditingActivityChange={setEditingActivity}
        onAddPlayerOpenChange={setIsAddPlayerOpen}
        onAddActivityOpenChange={setIsAddActivityOpen}
        onPlayerUpdate={handlePlayerUpdateWrapper}
        onActivityUpdate={async (activity) => {
          await handleActivityUpdate(activity);
          return true;
        }}
        onAddPlayer={handleAddPlayer}
        onAddActivity={handleAddActivity}
      />
    </LayoutMain>
  );
}
