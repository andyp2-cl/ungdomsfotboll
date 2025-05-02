
import { useState, useEffect, useCallback } from "react";
import { Activity } from "@/types/player";
import { useQuery } from "@tanstack/react-query";
import { fetchActivitiesFromDB } from "@/utils/storage/activity/fetch-operations";
import { toast } from "sonner";

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  
  // Use React Query with improved caching strategy and error handling
  const { refetch, isRefetching } = useQuery({
    queryKey: ['activities', lastRefreshTime],
    queryFn: async () => {
      try {
        // Attempt to fetch with forced update if it's first time or explicit refresh
        const fetchedActivities = await fetchActivitiesFromDB({ 
          silent: true,
          forceRefresh: true // Always force a fresh load from database
        });
        
        if (fetchedActivities && fetchedActivities.length > 0) {
          // Special log for match data
          const matches = fetchedActivities.filter(a => a.type === 'match');
          console.log(`Loaded ${matches.length} matches of ${fetchedActivities.length} total activities`);
          
          // Log match scores for debugging
          if (matches.length > 0) {
            console.log("Match scores sample:", matches.slice(0, 3).map(m => ({
              id: m.id, 
              name: m.name,
              homeScore: m.homeScore, 
              awayScore: m.awayScore
            })));
          }
          
          // Update state
          setActivities(fetchedActivities);
          setLoadError(null);
          return fetchedActivities;
        } else {
          console.warn("No activities loaded or empty result");
          // Om ingen data returnerades, behåll nuvarande data
          return activities;
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        setLoadError(error instanceof Error ? error : new Error("Unknown error"));
        toast.error("Kunde inte hämta aktiviteter");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retryDelay: attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000)
  });

  // Function to manually refresh activities
  const refreshActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      setLastRefreshTime(Date.now());
      await refetch();
      toast.success("Aktiviteter uppdaterade");
    } catch (error) {
      console.error("Error refreshing activities:", error);
      toast.error("Kunde inte uppdatera aktiviteter");
    } finally {
      setIsLoading(false);
    }
  }, [refetch]);

  // Initial fetch
  useEffect(() => {
    // This triggers the first query
    setLastRefreshTime(Date.now());
    
    // Fetch activities again if user comes back online
    const handleOnline = () => {
      toast.info("Du är online igen! Uppdaterar aktiviteter...");
      refreshActivities();
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refreshActivities]);
  
  return {
    activities,
    setActivities,
    isLoading,
    setIsLoading,
    loadError,
    setLoadError,
    isRefreshing: isRefetching,
    refreshActivities,
    lastRefreshTime
  };
}
