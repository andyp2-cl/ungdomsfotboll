
import { useState, useCallback, useMemo } from "react";
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
  handleMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
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

  // Filter activities by search query
  const filteredBySearchActivities = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeView === "historical" ? filteredHistoricalActivities : filteredActivities;
    }
    
    const activitiesToFilter = activeView === "historical" ? filteredHistoricalActivities : filteredActivities;
    return filterActivitiesBySearchTerm(activitiesToFilter, searchQuery);
  }, [searchQuery, filteredActivities, filteredHistoricalActivities, activeView]);

  // Handle view change
  const handleViewChange = useCallback((view: "current" | "historical" | "statistics" | "tools") => {
    setActiveView(view);
    setSelectedActivity(null);
    setSelectedPlayer(null);
  }, [setSelectedActivity]);

  // Handle player selection
  const handlePlayerSelect = useCallback((player: Player | null) => {
    setSelectedPlayer(player);
    setSelectedActivity(null);
  }, [setSelectedActivity]);

  // Determine if current view is historical
  const isHistorical = activeView === "historical";

  // Render content based on current view and selection
  const renderContent = useCallback(() => {
    if (selectedPlayer) {
      const playerActivities = activities.filter(activity => 
        activity.participants?.includes(selectedPlayer.id)
      );
      
      return {
        viewType: "player-detail",
        player: selectedPlayer,
        activities: playerActivities,
        selectedPlayerId: selectedPlayer.id,
        searchQuery
      };
    }
    
    if (selectedActivity) {
      return {
        viewType: "activity-detail",
        selectedActivity,
        activities,
        searchQuery
      };
    }
    
    return {
      activities: filteredBySearchActivities,
      searchQuery,
      selectedActivity: null
    };
  }, [activities, selectedActivity, selectedPlayer, filteredBySearchActivities, searchQuery]);

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
