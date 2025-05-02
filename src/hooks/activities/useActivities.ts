
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
  
  // Use React Query to fetch activities
  const { refetch, isRefetching } = useQuery({
    queryKey: ['activities', lastRefreshTime],
    queryFn: async () => {
      try {
        const fetchedActivities = await fetchActivitiesFromDB({ silent: true });
        setActivities(fetchedActivities);
        setLoadError(null);
        return fetchedActivities;
      } catch (error) {
        console.error("Error fetching activities:", error);
        setLoadError(error instanceof Error ? error : new Error("Unknown error"));
        // Use toast directly from sonner
        toast.error("Kunde inte hämta aktiviteter");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    refetchOnWindowFocus: false
  });

  // Function to manually refresh activities
  const refreshActivities = useCallback(async () => {
    try {
      setLastRefreshTime(Date.now());
      await refetch();
    } catch (error) {
      console.error("Error refreshing activities:", error);
    }
  }, [refetch]);

  // Initial fetch effect
  useEffect(() => {
    // This will trigger the initial query
    setLastRefreshTime(Date.now());
  }, []);
  
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
