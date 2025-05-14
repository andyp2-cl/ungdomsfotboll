
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlayerTabContent } from "@/components/tabs/PlayerTabContent";
import { ActivityTabContent } from "@/components/tabs/activity-tab";
import { PageDialogs } from "./PageDialogs";
import { Player, Activity } from "@/types/player";
import { TabItem } from "@/types/tabs";
import { setActiveTab } from "@/utils/storage";

interface MainTabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;

  // Player state
  players: Player[];
  selectedPlayer: Player | null;
  filteredPlayers: Player[];
  editingPlayer: Player | null;
  searchQuery: string;
  selectedGrades: string[];
  viewMode: "list" | "grid" | "stats";
  setSearchQuery: (query: string) => void;
  handleGradeChange: (grade: any) => void;
  setSelectedPlayer: (player: Player | null) => void;
  setEditingPlayer: (player: Player | null) => void;
  setViewMode: (mode: "list" | "grid" | "stats") => void;
  isAddPlayerOpen: boolean;
  setIsAddPlayerOpen: (isOpen: boolean) => void;
  handlePlayerUpdate: (player: Player) => void;
  handleBulkPlayerUpdate: (players: Player[]) => void;
  handleAddPlayer: (player: Player) => void;
  handleDeletePlayer?: (playerId: string) => Promise<void>;
  
  // Activity state
  activities: Activity[];
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  selectedActivity: Activity | null;
  setSelectedActivity: (activity: Activity | null) => void;
  editingActivity: Activity | null;
  setEditingActivity: (activity: Activity | null) => void;
  isAddActivityOpen: boolean;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  selectedActivityTypes: string[];
  handleActivityTypeChange: (type: string) => void;
  handleActivityUpdate: (activity: Activity) => void;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDelete: (activityId: string) => Promise<boolean>;
  handleImportActivities: (activities: Activity[]) => Promise<boolean>;
  handleClearHistorical: () => Promise<boolean>;
  handleAddActivity: (activity: Activity) => void;
  handleMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => void;
  onPlayerActivitySelect: (activity: Activity) => void;
}

export function MainTabs({
  tabs,
  activeTabId,
  onTabChange,
  
  // Player state
  players,
  selectedPlayer,
  filteredPlayers,
  editingPlayer,
  searchQuery,
  selectedGrades,
  viewMode,
  setSearchQuery,
  handleGradeChange,
  setSelectedPlayer,
  setEditingPlayer,
  setViewMode,
  isAddPlayerOpen,
  setIsAddPlayerOpen,
  handlePlayerUpdate,
  handleBulkPlayerUpdate,
  handleAddPlayer,
  handleDeletePlayer,
  
  // Activity state
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
  handleMatchResultUpdate,
  onPlayerActivitySelect
}: MainTabsProps) {
  
  const handleTabChange = (value: string) => {
    onTabChange(value);
    setActiveTab(value); // Save active tab to storage
  };
  
  return (
    <>
      <Tabs value={activeTabId} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1"
              disabled={tab.disabled}
            >
              {tab.icon && tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="players" className="mt-0">
          <PlayerTabContent 
            players={players}
            activities={activities}
            selectedPlayer={selectedPlayer}
            filteredPlayers={filteredPlayers}
            searchQuery={searchQuery}
            selectedGrades={selectedGrades}
            viewMode={viewMode}
            isAddPlayerOpen={isAddPlayerOpen}
            setSearchQuery={setSearchQuery}
            handleGradeChange={handleGradeChange}
            setSelectedPlayer={setSelectedPlayer}
            setViewMode={setViewMode}
            handlePlayerUpdate={handlePlayerUpdate}
            handleBulkPlayerUpdate={handleBulkPlayerUpdate}
            handleDeletePlayer={handleDeletePlayer}
            setIsAddPlayerOpen={setIsAddPlayerOpen}
            setEditingPlayer={setEditingPlayer}
            onActivitySelect={onPlayerActivitySelect}
          />
        </TabsContent>
        
        <TabsContent value="activities" className="mt-0">
          <ActivityTabContent 
            players={players}
            activities={activities}
            filteredActivities={filteredActivities}
            filteredHistoricalActivities={filteredHistoricalActivities}
            selectedActivity={selectedActivity}
            selectedActivityTypes={selectedActivityTypes}
            onTypeChange={handleActivityTypeChange}
            onSelectActivity={setSelectedActivity}
            onKioskUpdate={handleKioskUpdate}
            onDeleteActivity={handleDelete}
            onImportActivities={handleImportActivities}
            onClearHistoricalActivities={handleClearHistorical}
            onAddActivityClick={() => setIsAddActivityOpen(true)}
            onMatchResultUpdate={handleMatchResultUpdate}
            onPlayerSelect={setSelectedPlayer}
          />
        </TabsContent>
      </Tabs>
      
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
