
import { useState, useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { ActivityList } from "@/components/activity-list";
import { ActivityDetail } from "@/components/activity-detail";
import { PlayerDetail } from "@/components/PlayerDetail";
import { StatisticsTabsWrapper } from "@/components/player-management/statistics/StatisticsTabsWrapper";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseActivityTabViewsProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  setSelectedActivity: (activity: Activity | null) => void;
  searchQuery: string;
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  setEditingActivity: (activity: Activity | null) => void;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  handleActivityUpdate: (activity: Activity) => void;
  handleKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function useActivityTabViews({
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
  handleMatchResultUpdate
}: UseActivityTabViewsProps) {
  const [activeView, setActiveView] = useState<"upcoming" | "historical" | "statistics">("historical");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const isMobile = useIsMobile();

  const handlePlayerSelect = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayer(player);
      setSelectedActivity(null);
    }
  };

  // Properly handle view changes to ensure statistics tab works
  const handleViewChange = (value: string) => {
    if (value === "upcoming" || value === "historical" || value === "statistics") {
      setActiveView(value as "upcoming" | "historical" | "statistics");
      setSelectedActivity(null);
      setSelectedPlayer(null);
    }
  };

  const isHistorical = activeView === "historical";

  const filteredBySearchActivities = useMemo(() => {
    const baseActivities = isHistorical 
      ? filteredHistoricalActivities
      : filteredActivities;

    return searchQuery
      ? baseActivities.filter(activity => 
          activity.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : baseActivities;
  }, [searchQuery, isHistorical, filteredActivities, filteredHistoricalActivities]);

  // Calculate statistics data
  const gradeData = useMemo(() => {
    return players.reduce((acc, player) => {
      if (player.positions?.includes("TRÄNARE")) return acc;
      
      const grade = player.grade;
      const existingGrade = acc.find(item => item.grade === grade);
      
      if (existingGrade) {
        existingGrade.players++;
      } else if (grade) {
        acc.push({ grade, players: 1 });
      }
      
      return acc;
    }, [] as { grade: string, players: number }[]).sort((a, b) => a.grade.localeCompare(b.grade));
  }, [players]);

  const renderContent = () => {
    if (selectedPlayer) {
      return (
        <PlayerDetail 
          player={selectedPlayer} 
          activities={activities} 
          onClose={() => setSelectedPlayer(null)}
          onEdit={(player) => console.log("Edit player not implemented in this context", player)}
          onPlayerUpdate={() => console.log("Player update not implemented in this context")}
          allPlayers={players}
        />
      );
    }
    
    if (selectedActivity) {
      const relatedActivities = selectedActivity?.cupId 
        ? activities.filter(a => a.cupId === selectedActivity.cupId && a.id !== selectedActivity.id)
        : [];

      const cupMatches = selectedActivity?.type === 'cup'
        ? activities.filter(a => a.cupId === selectedActivity.id)
        : [];

      return (
        <ActivityDetail 
          activity={selectedActivity}
          players={players}
          onBack={() => setSelectedActivity(null)}
          onEdit={setEditingActivity}
          onDeleteActivity={handleDeleteActivity}
          onActivityUpdate={handleActivityUpdate}
          onKioskAssignmentUpdate={handleKioskAssignmentUpdate}
          onActivitySelect={setSelectedActivity}
          relatedActivities={relatedActivities}
          cupMatches={cupMatches}
          allActivities={activities}
          onClose={() => setSelectedActivity(null)}
          onMatchResultUpdate={handleMatchResultUpdate}
          onPlayerSelect={handlePlayerSelect}
        />
      );
    }
    
    if (activeView === "statistics") {
      return (
        <StatisticsTabsWrapper 
          players={players}
          activities={activities}
          gradeData={gradeData}
        />
      );
    }
    
    return (
      <ActivityList 
        activities={filteredBySearchActivities}
        players={players}
        onSelect={setSelectedActivity}
        onPlayerSelect={handlePlayerSelect}
        isHistorical={isHistorical}
        isMobile={isMobile}
        noResultsMessage={searchQuery ? `Inga matcher hittades för "${searchQuery}"` : "Inga aktiviteter hittades"}
      />
    );
  };

  return {
    activeView,
    handleViewChange,
    selectedPlayer,
    setSelectedPlayer,
    handlePlayerSelect,
    renderContent,
    isHistorical,
    filteredBySearchActivities
  };
}
