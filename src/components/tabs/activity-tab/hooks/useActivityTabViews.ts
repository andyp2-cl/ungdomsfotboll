
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
  handleMatchResultUpdate
}: UseActivityTabViewsProps) => {
  const [activeView, setActiveView] = useState<"upcoming" | "historical" | "statistics">("historical");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [previousView, setPreviousView] = useState<"upcoming" | "historical" | "statistics">("historical");

  // Handle player selection
  const handlePlayerSelect = useCallback((playerId: string) => {
    console.log("handlePlayerSelect called with playerId:", playerId);
    
    if (!playerId) {
      console.log("Empty playerId, clearing selected player");
      setSelectedPlayer(null);
      return;
    }
    
    const player = players.find(p => p.id === playerId);
    if (player) {
      console.log("Found player:", player.name);
      setSelectedPlayer(player);
      setSelectedActivity(null);
    } else {
      console.warn("Player not found for ID:", playerId);
    }
  }, [players, setSelectedActivity]);

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
    console.log("renderContent called, selectedPlayer:", selectedPlayer?.name, "selectedActivity:", selectedActivity?.name);
    
    // Handle Player detail view
    if (selectedPlayer) {
      const playerActivities = activities.filter(activity => 
        activity.participants?.includes(selectedPlayer.id)
      );
      
      console.log(`Rendering player detail for ${selectedPlayer.name} with ${playerActivities.length} activities`);
      
      return {
        viewType: "player-detail",
        player: selectedPlayer,
        activities: playerActivities
      };
    }
    
    // Handle Activity detail view
    if (selectedActivity) {
      const relatedActivities = getRelatedActivities(selectedActivity);
      const cupMatches = getCupMatches(selectedActivity);
      
      console.log(`Rendering activity detail for ${selectedActivity.name}`);
      
      return {
        viewType: "activity-detail",
        activity: selectedActivity,
        relatedActivities,
        cupMatches
      };
    }
    
    // Handle Statistics view
    if (activeView === "statistics") {
      console.log("Rendering statistics view");
      return {
        viewType: "statistics"
      };
    }
    
    // Handle Activities list view
    console.log(`Rendering activities list with ${filteredBySearchActivities.length} items`);
    
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
