
import { useState, useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { filterActivitiesBySearchTerm } from "@/utils/search";

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
  handleActivityUpdate: (activity: Activity) => Promise<void>;
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
  const [activeView, setActiveView] = useState<"current" | "historical" | "statistics" | "tools">("current");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Filter activities by search term
  const filteredBySearchActivities = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeView === "historical" ? filteredHistoricalActivities : filteredActivities;
    }
    
    const activitiesToFilter = activeView === "historical" ? filteredHistoricalActivities : filteredActivities;
    return filterActivitiesBySearchTerm(activitiesToFilter, searchQuery);
  }, [searchQuery, filteredActivities, filteredHistoricalActivities, activeView]);

  const handleViewChange = (view: "current" | "historical" | "statistics" | "tools") => {
    setActiveView(view);
    // Reset selections when changing views
    setSelectedActivity(null);
    setSelectedPlayer(null);
  };

  const handlePlayerSelect = (player: Player | null) => {
    setSelectedPlayer(player);
    setSelectedActivity(null);
  };

  // Determine if we're showing historical view
  const isHistorical = activeView === "historical";

  // Render content based on active view
  const renderContent = () => {
    return {
      current: {
        activities: filteredBySearchActivities,
        isHistorical: false,
      },
      historical: {
        activities: filteredBySearchActivities,
        isHistorical: true, 
      },
      statistics: {
        activities: activities,
        isStatistics: true,
      },
      tools: {
        activities: activities,
        isTools: true,
      }
    }[activeView];
  };

  return {
    activeView,
    handleViewChange,
    selectedPlayer,
    handlePlayerSelect,
    renderContent,
    isHistorical,
    filteredBySearchActivities
  };
}
