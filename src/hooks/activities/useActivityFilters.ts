import { useState, useMemo, useCallback } from "react";
import { Activity } from "@/types/player";

export function useActivityFilters(activities: Activity[]) {
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([]);
  const [selectedCups, setSelectedCups] = useState<string[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  // Memoize expensive calculations
  const currentActivities = useMemo(() => {
    const today = new Date();
    return activities.filter(activity => new Date(activity.date) >= today);
  }, [activities]);

  const historicalActivities = useMemo(() => {
    const today = new Date();
    return activities.filter(activity => new Date(activity.date) < today);
  }, [activities]);

  // Memoize available filter options
  const availableActivityTypes = useMemo(() => {
    const types = new Set<string>();
    activities.forEach(activity => {
      if (activity.type) types.add(activity.type);
    });
    return Array.from(types).sort();
  }, [activities]);

  const availableCups = useMemo(() => {
    const cups = new Set<string>();
    activities.forEach(activity => {
      if (activity.cupName) cups.add(activity.cupName);
    });
    return Array.from(cups).sort();
  }, [activities]);

  const availableLeagues = useMemo(() => {
    const leagues = new Set<string>();
    activities.forEach(activity => {
      if (activity.league_id) leagues.add(activity.league_id);
    });
    return Array.from(leagues).sort();
  }, [activities]);

  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    activities.forEach(activity => {
      if (activity.location?.name) locations.add(activity.location.name);
    });
    return Array.from(locations).sort();
  }, [activities]);

  const availablePlayers = useMemo(() => {
    const players = new Set<string>();
    activities.forEach(activity => {
      activity.participants?.forEach(playerId => {
        players.add(playerId);
      });
    });
    return Array.from(players).sort();
  }, [activities]);

  // Memoize filtered activities
  const filteredCurrentActivities = useMemo(() => {
    if (!Array.isArray(currentActivities) || currentActivities.length === 0) {
      return [];
    }

    let filtered = currentActivities;

    // Filter by activity type
    if (selectedActivityTypes.length > 0) {
      filtered = filtered.filter(activity => 
        activity.type && selectedActivityTypes.includes(activity.type)
      );
    }

    // Filter by cup
    if (selectedCups.length > 0) {
      filtered = filtered.filter(activity => 
        activity.cupName && selectedCups.includes(activity.cupName)
      );
    }

         // Filter by league
     if (selectedLeagues.length > 0) {
       filtered = filtered.filter(activity => 
         activity.league_id && selectedLeagues.includes(activity.league_id)
       );
     }

    // Filter by location
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(activity => 
        activity.location?.name && selectedLocations.includes(activity.location.name)
      );
    }

    // Filter by players
    if (selectedPlayers.length > 0) {
      filtered = filtered.filter(activity => 
        activity.participants?.some(playerId => selectedPlayers.includes(playerId))
      );
    }

    // Filter by date range
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        if (dateRange.start && activityDate < dateRange.start) return false;
        if (dateRange.end && activityDate > dateRange.end) return false;
        return true;
      });
    }

    // Group activities by month
    const activitiesByMonth = filtered.reduce((acc, activity) => {
      if (!activity || !activity.date) {
        console.warn('Invalid activity in currentActivities:', activity);
        return acc;
      }

      const date = new Date(activity.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      
      acc[monthKey].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);
    
    // Sort activities within each month
    Object.keys(activitiesByMonth).forEach(month => {
      activitiesByMonth[month].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        const dateComparison = dateA.getTime() - dateB.getTime();
        
        if (dateComparison === 0 && a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        
        return dateComparison;
      });
    });
    
    // Flatten the sorted groups
    const sortedMonthKeys = Object.keys(activitiesByMonth).sort();
    return sortedMonthKeys.flatMap(month => activitiesByMonth[month]);
  }, [currentActivities, selectedActivityTypes, selectedCups, selectedLeagues, selectedLocations, selectedPlayers, dateRange]);

  const filteredHistoricalActivities = useMemo(() => {
    if (!Array.isArray(historicalActivities) || historicalActivities.length === 0) {
      return [];
    }

    let filtered = historicalActivities;

    // Apply same filters as current activities
    if (selectedActivityTypes.length > 0) {
      filtered = filtered.filter(activity => 
        activity.type && selectedActivityTypes.includes(activity.type)
      );
    }

    if (selectedCups.length > 0) {
      filtered = filtered.filter(activity => 
        activity.cupName && selectedCups.includes(activity.cupName)
      );
    }

         if (selectedLeagues.length > 0) {
       filtered = filtered.filter(activity => 
         activity.league_id && selectedLeagues.includes(activity.league_id)
       );
     }

    if (selectedLocations.length > 0) {
      filtered = filtered.filter(activity => 
        activity.location?.name && selectedLocations.includes(activity.location.name)
      );
    }

    if (selectedPlayers.length > 0) {
      filtered = filtered.filter(activity => 
        activity.participants?.some(playerId => selectedPlayers.includes(playerId))
      );
    }

    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        if (dateRange.start && activityDate < dateRange.start) return false;
        if (dateRange.end && activityDate > dateRange.end) return false;
        return true;
      });
    }

    return filtered
      .sort((a, b) => {
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        
        if (dateComparison === 0 && a.time && b.time) {
          return b.time.localeCompare(a.time);
        }
        
        return dateComparison;
      });
  }, [historicalActivities, selectedActivityTypes, selectedCups, selectedLeagues, selectedLocations, selectedPlayers, dateRange]);

  // Memoize filter handlers
  const handleActivityTypeChange = useCallback((type: string, checked: boolean) => {
    setSelectedActivityTypes(prev => 
      checked 
        ? [...prev, type]
        : prev.filter(t => t !== type)
    );
  }, []);

  const handleCupChange = useCallback((cup: string, checked: boolean) => {
    setSelectedCups(prev => 
      checked 
        ? [...prev, cup]
        : prev.filter(c => c !== cup)
    );
  }, []);

  const handleLeagueChange = useCallback((league: string, checked: boolean) => {
    setSelectedLeagues(prev => 
      checked 
        ? [...prev, league]
        : prev.filter(l => l !== league)
    );
  }, []);

  const handleLocationChange = useCallback((location: string, checked: boolean) => {
    setSelectedLocations(prev => 
      checked 
        ? [...prev, location]
        : prev.filter(l => l !== location)
    );
  }, []);

  const handlePlayerChange = useCallback((playerId: string, checked: boolean) => {
    setSelectedPlayers(prev => 
      checked 
        ? [...prev, playerId]
        : prev.filter(p => p !== playerId)
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedActivityTypes([]);
    setSelectedCups([]);
    setSelectedLeagues([]);
    setSelectedLocations([]);
    setSelectedPlayers([]);
    setDateRange({ start: null, end: null });
  }, []);

  return {
    // Filtered data
    filteredCurrentActivities,
    filteredHistoricalActivities,
    
    // Available options
    availableActivityTypes,
    availableCups,
    availableLeagues,
    availableLocations,
    availablePlayers,
    
    // Current filter states
    selectedActivityTypes,
    selectedCups,
    selectedLeagues,
    selectedLocations,
    selectedPlayers,
    dateRange,
    
    // Filter handlers
    handleActivityTypeChange,
    handleCupChange,
    handleLeagueChange,
    handleLocationChange,
    handlePlayerChange,
    setDateRange,
    clearAllFilters
  };
}
