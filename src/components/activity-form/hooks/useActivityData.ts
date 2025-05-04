
import { useQuery } from "@tanstack/react-query";
import { Activity } from "@/types/player";
import { getStoredActivities } from "@/utils/storage/activity/fetch";
import { supabase } from "@/lib/supabase/client";
import { getAllCupNames } from "@/lib/supabase/activities";

// Define a League type
export interface League {
  id: string;
  name: string;
  division: string;
  year: number;
}

/**
 * Fetches activities and leagues data for activity forms
 */
export function useActivityData() {
  // Fetch activities to get existing cup names
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => getStoredActivities({
      showToast: false,
      forceRefresh: false
    }),
  });

  // Fetch leagues from Supabase
  const { data: leagues = [], isLoading: leaguesLoading } = useQuery({
    queryKey: ["leagues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .order("year", { ascending: false })
        .order("name");
        
      if (error) {
        console.error("Error fetching leagues:", error);
        throw error;
      }
      
      return data || [];
    },
  });
  
  // Extract cup names when activities are loaded
  const cupNames = activities ? getAllCupNames(activities) : [];

  return {
    activities,
    leagues,
    cupNames,
    activitiesLoading,
    leaguesLoading
  };
}
