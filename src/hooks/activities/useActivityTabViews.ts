
import { useState, useCallback } from "react";
import { Activity, Player } from "@/types/player";

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
  onPlayerSelect?: (playerId: string) => void;
}

export const useActivityTabViews = ({
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
}: UseActivityTabViewsProps) => {
  const [activeView, setActiveView] = useState<"upcoming" | "historical" | "statistics">("historical");
  const [previousView, setPreviousView] = useState<"upcoming" | "historical" | "statistics">("historical");

  // Handle player selection
  const handlePlayerSelect = useCallback((playerId: string) => {
    console.log("useActivityTabViews: Player selected/deselected:", playerId);
    
    // Always use the external handler if provided
    if (onPlayerSelect) {
      console.log("useActivityTabViews: Using external onPlayerSelect handler");
      onPlayerSelect(playerId);
    }
  }, [onPlayerSelect]);

  // Handle view change
  const handleViewChange = useCallback((value: string) => {
    if (value === "upcoming" || value === "historical" || value === "statistics") {
      // Store the previous view before changing
      setPreviousView(activeView);
      setActiveView(value as "upcoming" | "historical" | "statistics");
      setSelectedActivity(null);
    }
  }, [setSelectedActivity, activeView]);

  // Determine if current view is historical
  const isHistorical = activeView === "historical";

  // Filter activities by search query
  const filteredBySearchActivities = isHistorical 
    ? filteredHistoricalActivities.filter(activity => 
        searchQuery 
          ? activity.name.toLowerCase().includes(searchQuery.toLowerCase()) 
          : true)
    : filteredActivities.filter(activity => 
        searchQuery 
          ? activity.name.toLowerCase().includes(searchQuery.toLowerCase()) 
          : true);

  // Get related activities for a selected activity
  const getRelatedActivities = useCallback((activity: Activity) => {
    if (activity.cupId) {
      return activities.filter(a => 
        a.cupId === activity.cupId && a.id !== activity.id
      );
    }
    return [];
  }, [activities]);

  // Get cup matches for a selected cup
  const getCupMatches = useCallback((activity: Activity) => {
    if (activity.type === 'cup') {
      return activities.filter(a => a.cupId === activity.id);
    }
    return [];
  }, [activities]);

  // Render content based on current view and selection
  const renderContent = useCallback(() => {
    // Handle Statistics view
    if (activeView === "statistics") {
      // Statistics will be rendered by the parent component
      return null;
    }
    
    // Handle Activity detail view
    if (selectedActivity) {
      const relatedActivities = getRelatedActivities(selectedActivity);
      const cupMatches = getCupMatches(selectedActivity);
      
      return {
        viewType: "activity-detail",
        activity: selectedActivity,
        relatedActivities,
        cupMatches
      };
    }
    
    // Handle Activities list view
    return {
      viewType: "activities-list",
      activities: filteredBySearchActivities,
      searchQuery
    };
  }, [
    activeView, 
    selectedActivity, 
    activities, 
    filteredBySearchActivities, 
    getRelatedActivities,
    getCupMatches,
    searchQuery
  ]);

  return {
    activeView,
    handleViewChange,
    handlePlayerSelect,
    renderContent,
    isHistorical,
    filteredBySearchActivities,
    previousView
  };
};
