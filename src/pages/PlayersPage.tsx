import React, { useState, useEffect, useCallback } from "react";
import { Player, Activity } from "@/types/player";
import { PageContainer } from "@/components/page-containers/PageContainer";
import { PlayerHeader } from "@/components/PlayerHeader";
import { MainTabs } from "@/components/tabs/MainTabs";
import { PlayerDialog } from "@/components/player-ui/PlayerDialog";
import { AddPlayerDialog } from "@/components/player-ui/AddPlayerDialog";
import { PullToRefresh } from "react-js-pull-to-refresh";
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
  const { activities, handleActivityUpdate, handleRefresh } = useActivities();

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

  return (
    <PageContainer isLoading={isLoading}>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="flex flex-col min-h-screen">
          <PlayerHeader />
          
          <MainTabs 
            tabs={tabItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            players={players}
            activities={activities}
            searchQuery={searchQuery}
            selectedGrades={selectedGrades}
            selectedPositions={selectedPositions}
            activeFiltersCount={activeFiltersCount}
            selectedPlayer={selectedPlayer}
            viewMode={viewMode}
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
          />

          <PlayerDialog
            isOpen={!!selectedPlayer || !!editingPlayer}
            player={selectedPlayer || editingPlayer}
            onClose={handleClosePlayerDialog}
            onPlayerUpdate={handlePlayerUpdate}
            onDeletePlayer={handleDeletePlayer}
          />

          <AddPlayerDialog
            isOpen={isAddPlayerOpen}
            onClose={() => setIsAddPlayerOpen(false)}
            onAddPlayer={handleAddPlayer}
          />
        </div>
      </PullToRefresh>
    </PageContainer>
  );
}
