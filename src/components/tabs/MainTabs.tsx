
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlayerTabContent } from "@/components/tabs/PlayerTabContent";
import { ActivityTabContent } from "@/components/tabs/activity-tab/ActivityTabContent";
import { PageDialogs } from "./PageDialogs";
import { Player, Activity, PlayerGrade } from "@/types/player";
import { TabItem } from "@/types/tabs";
import { saveActiveTab } from "@/utils/storage/tabs";

interface MainTabsProps {
  tabs?: TabItem[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;

  // Player state
  players: Player[];
  selectedPlayer: Player | null;
  filteredPlayers: Player[];
  editingPlayer: Player | null;
  searchQuery: string;
  selectedGrades: PlayerGrade[];
  viewMode: "list" | "grid";
  setSearchQuery: (query: string) => void;
  handleGradeChange: (grade: PlayerGrade) => void;
  setSelectedPlayer: (player: Player | null) => void;
  setEditingPlayer: (player: Player | null) => void;
  setViewMode: (mode: "list" | "grid") => void;
  isAddPlayerOpen: boolean;
  setIsAddPlayerOpen: (isOpen: boolean) => void;
  handlePlayerUpdate: (player: Player) => Promise<void>;
  handleBulkPlayerUpdate: (players: Player[]) => Promise<void>;
  handleAddPlayer: (player: Player) => Promise<void>;
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
  handleActivityUpdate: (activity: Activity) => Promise<void>;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDelete: (activityId: string) => Promise<boolean>;
  handleImportActivities: (activities: Activity[]) => Promise<boolean>;
  handleClearHistorical: () => Promise<boolean>;
  handleAddActivity: (activity: Activity) => Promise<void>;
  handleMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
  onPlayerActivitySelect: (activity: Activity) => Promise<void>;
  onPlayerSelect?: (playerId: string) => void;
}

export function MainTabs({
  tabs = [
    { id: "players", label: "Spelare", icon: null },
    { id: "activities", label: "Aktiviteter", icon: null },
  ],
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
  onPlayerActivitySelect,
  onPlayerSelect
}: MainTabsProps) {
  
  const handleTabChange = (value: string) => {
    // Clear selected player and activity when switching tabs
    if (value === "players") {
      setSelectedPlayer(null);
    } else if (value === "activities") {
      setSelectedActivity(null);
    }
    
    onTabChange(value);
    saveActiveTab(value); // Save active tab to storage
  };
  
  // Handler for player selection from activities tab
  const handlePlayerSelect = (playerId: string) => {
    console.log("MainTabs: handlePlayerSelect called with:", playerId);
    if (onPlayerSelect) {
      console.log("MainTabs: Using provided onPlayerSelect handler");
      onPlayerSelect(playerId);
    } else if (playerId) {
      console.log("MainTabs: No external handler provided, using default behavior");
      const player = players.find(p => p.id === playerId);
      if (player) {
        console.log("MainTabs: Player found:", player.name);
        setSelectedPlayer(player);
      }
    } else {
      setSelectedPlayer(null);
    }
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
            onActivitySelect={async (activity) => {
              await onPlayerActivitySelect(activity);
            }}
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
            handleActivityTypeChange={handleActivityTypeChange}
            setSelectedActivity={setSelectedActivity}
            handleActivityUpdate={handleActivityUpdate}
            handleKioskAssignmentUpdate={handleKioskUpdate}
            handleDeleteActivity={handleDelete}
            handleImportedActivities={handleImportActivities}
            handleClearHistoricalActivities={handleClearHistorical}
            setIsAddActivityOpen={setIsAddActivityOpen}
            setEditingActivity={setEditingActivity}
            isAddActivityOpen={isAddActivityOpen}
            handleMatchResultUpdate={handleMatchResultUpdate}
            onPlayerSelect={handlePlayerSelect}
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
