
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
  handleActivityUpdate: (activity: Activity) => Promise<void>;
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
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [previousView, setPreviousView] = useState<"upcoming" | "historical" | "statistics">("historical");

  // Handle player selection with better logging and state management
  const handlePlayerSelect = useCallback((playerId: string) => {
    console.log("useActivityTabViews: handlePlayerSelect called with playerId:", playerId);
    
    if (playerId === "" || !playerId) {
      console.log("useActivityTabViews: Clearing selected player");
      setSelectedPlayer(null);
      
      // Also call external handler to sync global state
      if (onPlayerSelect) {
        onPlayerSelect("");
      }
      return;
    }
    
    const player = players.find(p => p.id === playerId);
    if (player) {
      console.log("useActivityTabViews: Found player:", player.name);
      console.log("useActivityTabViews: Setting local selected player state");
      setSelectedPlayer(player);
      
      // Don't clear the activity when selecting a player - show both
      console.log("useActivityTabViews: Keeping activity selection while showing player preview");
      
      // Call external handler if provided
      if (onPlayerSelect) {
        console.log("useActivityTabViews: Calling external onPlayerSelect");
        onPlayerSelect(playerId);
      }
    } else {
      console.log("useActivityTabViews: Player not found with id:", playerId);
    }
  }, [players, onPlayerSelect]);

  // Handle view change
  const handleViewChange = useCallback((value: string) => {
    if (value === "upcoming" || value === "historical" || value === "statistics") {
      // Store the previous view before changing
      setPreviousView(activeView);
      setActiveView(value as "upcoming" | "historical" | "statistics");
      setSelectedActivity(null);
      setSelectedPlayer(null);
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
    console.log("useActivityTabViews: renderContent called");
    console.log("useActivityTabViews: activeView:", activeView);
    console.log("useActivityTabViews: selectedPlayer:", selectedPlayer?.name);
    console.log("useActivityTabViews: selectedActivity:", selectedActivity?.name);
    
    // Handle Statistics view
    if (activeView === "statistics") {
      return {
        viewType: "statistics"
      };
    }
    
    // Handle Player detail view - show as overlay/preview when we have both player and activity
    if (selectedPlayer) {
      const playerActivities = activities.filter(activity => 
        activity.participants?.includes(selectedPlayer.id)
      );
      
      return {
        viewType: "player-preview", // Changed from "player-detail" to distinguish from full view
        player: selectedPlayer,
        activities: playerActivities,
        showAsOverlay: !!selectedActivity // Show as overlay if we also have an activity selected
      };
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
    selectedPlayer, 
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
    selectedPlayer,
    setSelectedPlayer,
    handlePlayerSelect,
    renderContent,
    isHistorical,
    filteredBySearchActivities,
    previousView
  };
};
