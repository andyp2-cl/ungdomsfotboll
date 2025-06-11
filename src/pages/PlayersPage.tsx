
import React, { useState, useEffect, useCallback } from "react";
import { Player, Activity } from "@/types/player";
import { PageContainer } from "@/components/page-containers/PageContainer";
import { PlayerHeader } from "@/components/PlayerHeader";
import { MainTabs } from "@/components/tabs/MainTabs";
import { usePlayers } from "@/hooks/players/usePlayers";
import { useActivities } from "@/hooks/activities/useActivities";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { TabItem } from "@/types/tabs";
import { Users, Calendar, BarChart3, TrendingUp, Dumbbell, FileSpreadsheet } from "lucide-react";

interface PlayersPageProps {
  initialTab?: string;
}

export default function PlayersPage({ initialTab = "players" }: PlayersPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const {
    players,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedGrades,
    selectedPositions,
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
    handlePositionChange,
    handlePlayerUpdate,
    handleBulkPlayerUpdate,
    handleAddPlayer,
    handleDeletePlayer,
    isMobile
  } = usePlayers();
  const { activities, handleActivityUpdate } = useActivities();

  const tabItems: TabItem[] = [
    {
      id: "players",
      label: "Spelare",
      icon: <Users className="h-4 w-4" />
    },
    {
      id: "activities", 
      label: "Aktiviteter",
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: "statistics",
      label: "Statistik", 
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      id: "development",
      label: "Utveckling",
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      id: "team-selection",
      label: "Laguttagning",
      icon: <Users className="h-4 w-4" />
    },
    {
      id: "training",
      label: "Träning",
      icon: <Dumbbell className="h-4 w-4" />
    },
    {
      id: "excel",
      label: "Excel",
      icon: <FileSpreadsheet className="h-4 w-4" />
    }
  ];

  const activeFiltersCount = selectedGrades.length + selectedPositions.length;

  const handleClosePlayerDialog = useCallback(() => {
    setEditingPlayer(undefined);
    setSelectedPlayer(undefined);
  }, [setEditingPlayer, setSelectedPlayer]);

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    navigate(`/activities/${activity.id}`);
  };

  const handlePlayerSelect = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayer(player);
    }
  };

  // Ensure viewMode is compatible
  const compatibleViewMode: "list" | "grid" = viewMode === "stats" ? "list" : viewMode as "list" | "grid";

  return (
    <PageContainer isLoading={isLoading}>
      <div className="flex flex-col min-h-screen">
        <PlayerHeader />
        
        <MainTabs 
          tabs={tabItems}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
          players={players}
          activities={activities}
          searchQuery={searchQuery}
          selectedGrades={selectedGrades}
          selectedPositions={selectedPositions}
          activeFiltersCount={activeFiltersCount}
          selectedPlayer={selectedPlayer}
          viewMode={compatibleViewMode}
          filteredPlayers={filteredPlayers}
          onSearchChange={setSearchQuery}
          onGradeChange={handleGradeChange}
          onPositionChange={handlePositionChange}
          onPlayerSelect={setSelectedPlayer}
          onPlayerUpdate={handlePlayerUpdate}
          onAddPlayerClick={() => setIsAddPlayerOpen(true)}
          onEditPlayerClick={setEditingPlayer}
          isMobile={isMobile}
          onActivitySelect={setSelectedActivity}
          onActivityUpdate={handleActivityUpdate}
          onBulkPlayerUpdate={handleBulkPlayerUpdate}
          onViewModeChange={setViewMode}
          
          // Activity props
          filteredActivities={activities}
          filteredHistoricalActivities={activities.filter(a => new Date(a.date) < new Date())}
          selectedActivity={selectedActivity}
          setSelectedActivity={setSelectedActivity}
          editingActivity={null}
          setEditingActivity={() => {}}
          isAddActivityOpen={false}
          setIsAddActivityOpen={() => {}}
          selectedActivityTypes={[]}
          handleActivityTypeChange={() => {}}
          handleKioskUpdate={async () => true}
          handleDelete={async () => true}
          handleImportActivities={async () => true}
          handleClearHistorical={async () => true}
          handleAddActivity={async () => {}}
          handleMatchResultUpdate={async () => {}}
          onPlayerActivitySelect={async () => {}}
          onPlayerSelect={handlePlayerSelect}
        />
      </div>
    </PageContainer>
  );
}
