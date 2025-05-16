
import React from "react";
import { Activity, Player } from "@/types/player";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTabHeader } from "./components/ActivityTabHeader";
import { ActivityTabSearch } from "./components/ActivityTabSearch";
import { useActivityTabViews } from "./hooks/useActivityTabViews";
import { ActivityTabViewContent } from "./components/ActivityTabViewContent";
import { PlayerPreview } from "@/components/player-preview/PlayerPreview";

interface ActivityTabContentProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  setSelectedActivity: (activity: Activity | null) => void;
  selectedActivityTypes: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  setEditingActivity: (activity: Activity | null) => void;
  handleActivityTypeChange: (type: string) => void;
  handleActivityUpdate: (activity: Activity) => Promise<void>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  handleKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
  onPlayerSelect?: (playerId: string) => void;
}

export function ActivityTabContent({
  activities,
  players,
  selectedActivity,
  setSelectedActivity,
  selectedActivityTypes,
  searchQuery,
  setSearchQuery,
  filteredActivities,
  filteredHistoricalActivities,
  setEditingActivity,
  handleActivityTypeChange,
  handleActivityUpdate,
  handleDeleteActivity,
  handleKioskAssignmentUpdate,
  handleMatchResultUpdate,
  onPlayerSelect
}: ActivityTabContentProps) {
  const {
    activeView,
    handleViewChange,
    selectedPlayer,
    previewPlayer,
    setPreviewPlayer,
    handlePlayerSelect,
    handleClosePlayerPreview,
    renderContent,
    isHistorical,
    filteredBySearchActivities,
    previousView
  } = useActivityTabViews({
    activities,
    players,
    selectedActivity,
    setSelectedActivity,
    searchQuery,
    filteredActivities,
    filteredHistoricalActivities,
    setEditingActivity,
    handleDeleteActivity,
    handleActivityUpdate,
    handleKioskAssignmentUpdate,
    handleMatchResultUpdate,
    onPlayerSelect
  });

  return (
    <div className="space-y-4">
      <ActivityTabHeader />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/30 rounded-md p-3">
        <Tabs
          defaultValue={isHistorical ? "historical" : "upcoming"}
          value={activeView}
          onValueChange={handleViewChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Kommande</TabsTrigger>
            <TabsTrigger value="historical">Historiska</TabsTrigger>
            <TabsTrigger value="statistics">Statistik</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <ActivityTabSearch 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        selectedActivityTypes={selectedActivityTypes}
        handleActivityTypeChange={handleActivityTypeChange}
        isHistorical={isHistorical}
      />
      
      <ActivityTabViewContent 
        activeView={activeView}
        renderContent={renderContent}
        players={players}
        activities={activities}
        onActivitySelect={setSelectedActivity}
        onPlayerSelect={handlePlayerSelect}
        onEditActivity={setEditingActivity}
        onActivityUpdate={handleActivityUpdate}
        onDeleteActivity={handleDeleteActivity}
        onKioskAssignmentUpdate={handleKioskAssignmentUpdate}
        onMatchResultUpdate={handleMatchResultUpdate}
        previousView={previousView}
      />
      
      {/* Player Preview Dialog */}
      <PlayerPreview
        player={previewPlayer}
        activities={activities}
        isOpen={!!previewPlayer}
        onClose={handleClosePlayerPreview}
        onActivitySelect={(activity) => {
          handleClosePlayerPreview();
          setSelectedActivity(activity);
        }}
      />
    </div>
  );
}
