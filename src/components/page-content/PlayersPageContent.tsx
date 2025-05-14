
import React from "react";
import { Player, Activity, PlayerGrade } from "@/types/player";
import { MainTabs } from "@/components/tabs/MainTabs";
import { PlayerTabContent } from "@/components/tabs/PlayerTabContent";
import { ActivityTabContent } from "@/components/tabs/activity-tab/ActivityTabContent";
import { PageDialogs } from "@/components/tabs/PageDialogs";
import { MobileNavBar } from "@/components/mobile-nav/MobileNavBar";
import { useIsMobile } from "@/hooks/use-mobile";

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
  selectedGrades: PlayerGrade[];  // Changed from string[] to PlayerGrade[]
  viewMode: "list" | "grid" | "stats";  // Explicit union type
  setViewMode: (mode: string) => void;
  handleGradeChange: (grade: string) => void;
  handlePlayerUpdate: (player: Player) => Promise<void>;
  handleBulkPlayerUpdate: (players: Player[]) => Promise<void>;
  handleAddPlayer: (player: Player) => Promise<void>;
  handleDeletePlayer: (playerId: string) => Promise<void>;
  
  // Activity data
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
  onPlayerActivitySelect: (activity: Activity) => void;
  handleMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function PlayersPageContent(props: PlayersPageContentProps) {
  const handleActivityUpdateWrapper = async (activity: Activity): Promise<void> => {
    await props.handleActivityUpdate(activity);
  };

  const isMobile = useIsMobile();
  
  return (
    <>
      <div className={`mb-4 ${isMobile ? 'pb-16' : ''}`}>
        <MainTabs 
          activeTabId={props.activeTab}
          onTabChange={props.setActiveTab}
          
          // Player state
          players={props.players}
          selectedPlayer={props.selectedPlayer}
          filteredPlayers={props.filteredPlayers}
          editingPlayer={props.editingPlayer}
          searchQuery={props.searchQuery}
          selectedGrades={props.selectedGrades}
          viewMode={props.viewMode}
          setSearchQuery={props.setSearchQuery}
          handleGradeChange={props.handleGradeChange as (grade: PlayerGrade) => void}
          setSelectedPlayer={props.setSelectedPlayer}
          setEditingPlayer={props.setEditingPlayer}
          setViewMode={props.setViewMode as (mode: "list" | "grid" | "stats") => void}
          isAddPlayerOpen={props.isAddPlayerOpen}
          setIsAddPlayerOpen={props.setIsAddPlayerOpen}
          handlePlayerUpdate={props.handlePlayerUpdate}
          handleBulkPlayerUpdate={props.handleBulkPlayerUpdate}
          handleAddPlayer={props.handleAddPlayer}
          handleDeletePlayer={props.handleDeletePlayer}
          
          // Activity state
          activities={props.activities}
          filteredActivities={props.filteredActivities}
          filteredHistoricalActivities={props.filteredHistoricalActivities}
          selectedActivity={props.selectedActivity}
          setSelectedActivity={props.setSelectedActivity}
          editingActivity={props.editingActivity}
          setEditingActivity={props.setEditingActivity}
          isAddActivityOpen={props.isAddActivityOpen}
          setIsAddActivityOpen={props.setIsAddActivityOpen}
          selectedActivityTypes={props.selectedActivityTypes}
          handleActivityTypeChange={props.handleActivityTypeChange}
          handleActivityUpdate={handleActivityUpdateWrapper}
          handleKioskUpdate={props.handleKioskUpdate}
          handleDelete={props.handleDelete}
          handleImportActivities={props.handleImportActivities}
          handleClearHistorical={props.handleClearHistorical}
          handleAddActivity={props.handleAddActivity}
          handleMatchResultUpdate={props.handleMatchResultUpdate}
          onPlayerActivitySelect={props.onPlayerActivitySelect}
        />
      </div>

      <MobileNavBar 
        activeTab={props.activeTab} 
        onTabChange={props.setActiveTab}
      />
    </>
  );
}
