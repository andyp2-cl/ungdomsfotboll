import React from "react";
import { Player, Activity, PlayerGrade } from "@/types/player";
import { MainTabs } from "@/components/tabs/MainTabs";
import { PlayerTabContent } from "@/components/tabs/PlayerTabContent";
import { ActivityTabContent } from "@/components/tabs/ActivityTabContent";
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
  handleMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
  
  // Loading state
  isLoading?: boolean;
  retryLoading?: () => void;
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
          activeTab={props.activeTab}
          setActiveTab={props.setActiveTab}
          playersContent={
            <PlayerTabContent 
              players={props.players}
              activities={props.activities}
              searchQuery={props.searchQuery}
              selectedGrades={props.selectedGrades}
              selectedPlayer={props.selectedPlayer}
              viewMode={props.viewMode}
              filteredPlayers={props.filteredPlayers}
              isAddPlayerOpen={props.isAddPlayerOpen}
              setSearchQuery={props.setSearchQuery}
              handleGradeChange={props.handleGradeChange}
              setSelectedPlayer={props.setSelectedPlayer}
              setViewMode={props.setViewMode}
              handlePlayerUpdate={props.handlePlayerUpdate}
              handleBulkPlayerUpdate={props.handleBulkPlayerUpdate}
              setIsAddPlayerOpen={props.setIsAddPlayerOpen}
              setEditingPlayer={props.setEditingPlayer}
              onActivitySelect={props.onPlayerActivitySelect}
            />
          }
          activitiesContent={
            <ActivityTabContent 
              activities={props.activities}
              players={props.players}
              selectedActivity={props.selectedActivity}
              selectedActivityTypes={props.selectedActivityTypes}
              filteredActivities={props.filteredActivities}
              filteredHistoricalActivities={props.filteredHistoricalActivities}
              isAddActivityOpen={props.isAddActivityOpen}
              isLoading={props.isLoading}
              retryLoading={props.retryLoading}
              handleActivityTypeChange={props.handleActivityTypeChange}
              setSelectedActivity={props.setSelectedActivity}
              handleActivityUpdate={handleActivityUpdateWrapper}
              setIsAddActivityOpen={props.setIsAddActivityOpen}
              setEditingActivity={props.setEditingActivity}
              handleKioskAssignmentUpdate={props.handleKioskUpdate}
              handleDeleteActivity={props.handleDelete}
              handleImportedActivities={props.handleImportActivities}
              handleClearHistoricalActivities={props.handleClearHistorical}
              handleMatchResultUpdate={props.handleMatchResultUpdate}
            />
          }
        />
      </div>

      <PageDialogs 
        editingPlayer={props.editingPlayer}
        editingActivity={props.editingActivity}
        isAddPlayerOpen={props.isAddPlayerOpen}
        isAddActivityOpen={props.isAddActivityOpen}
        setEditingPlayer={props.setEditingPlayer}
        setEditingActivity={props.setEditingActivity}
        setIsAddPlayerOpen={props.setIsAddPlayerOpen}
        setIsAddActivityOpen={props.setIsAddActivityOpen}
        handlePlayerUpdate={props.handlePlayerUpdate}
        handleActivityUpdate={handleActivityUpdateWrapper}
        handleAddPlayer={props.handleAddPlayer}
        handleAddActivity={props.handleAddActivity}
      />
      
      <MobileNavBar 
        activeTab={props.activeTab} 
        onTabChange={props.setActiveTab}
      />
    </>
  );
}
