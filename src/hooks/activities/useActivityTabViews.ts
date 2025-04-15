
import { useState, useCallback, useEffect } from "react";
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

  // Handle player selection
  const handlePlayerSelect = useCallback((playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayer(player);
      setSelectedActivity(null);
    }
  }, [players, setSelectedActivity]);

  // Handle view change
  const handleViewChange = useCallback((value: string) => {
    if (value === "upcoming" || value === "historical" || value === "statistics") {
      setActiveView(value as "upcoming" | "historical" | "statistics");
      setSelectedActivity(null);
      setSelectedPlayer(null);
    }
  }, [setSelectedActivity]);

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
      // First look for matches in the activity's matches array
      if (activity.matches && activity.matches.length > 0) {
        const matchesById = activities.filter(a => 
          activity.matches?.includes(a.id)
        );
        
        if (matchesById.length > 0) {
          console.log(`Found ${matchesById.length} matches by ID for cup ${activity.name}`);
          return matchesById;
        }
      }
      
      // Then look for matches with this activity as cupId
      const matchesByCupId = activities.filter(a => a.cupId === activity.id);
      if (matchesByCupId.length > 0) {
        console.log(`Found ${matchesByCupId.length} matches by cupId for cup ${activity.name}`);
        return matchesByCupId;
      }
    }
    return [];
  }, [activities]);

  // Log when selected activity changes to help debug cup matches
  useEffect(() => {
    if (selectedActivity && selectedActivity.type === 'cup') {
      console.log(`Selected cup: ${selectedActivity.name}`);
      
      // Log matches array
      console.log(`Cup matches array:`, selectedActivity.matches || []);
      
      // Log matches found by ID reference
      if (selectedActivity.matches && selectedActivity.matches.length > 0) {
        const matchesById = activities.filter(a => selectedActivity.matches?.includes(a.id));
        console.log(`Found ${matchesById.length} matches by ID:`, matchesById.map(m => m.name));
      }
      
      // Log matches by cupId reference
      const matchesByCupId = activities.filter(a => a.cupId === selectedActivity.id);
      console.log(`Found ${matchesByCupId.length} matches by cupId:`, matchesByCupId.map(m => m.name));
    }
  }, [selectedActivity, activities]);

  // Render content based on current view and selection
  const renderContent = useCallback(() => {
    // Handle Statistics view
    if (activeView === "statistics") {
      // Statistics will be rendered by the parent component
      return null;
    }
    
    // Handle Player detail view
    if (selectedPlayer) {
      const playerActivities = activities.filter(activity => 
        activity.participants?.includes(selectedPlayer.id)
      );
      
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
      
      console.log(`Rendering activity detail for ${selectedActivity.name} with ${cupMatches.length} cup matches`);
      
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
      activities: filteredBySearchActivities
    };
  }, [
    activeView, 
    selectedPlayer, 
    selectedActivity, 
    activities, 
    filteredBySearchActivities, 
    getRelatedActivities,
    getCupMatches
  ]);

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
};
