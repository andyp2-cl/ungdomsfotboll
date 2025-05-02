
import { Activity } from "@/types/player";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { PostgrestResponse } from "@supabase/supabase-js";

/**
 * Fetches activities from the database with improved error handling and retry logic
 */
export const fetchActivitiesFromDB = async (options: { 
  showToast?: boolean; 
  silent?: boolean;
  retryCount?: number;
  forceRefresh?: boolean;
} = {}): Promise<Activity[]> => {
  const { 
    showToast = false, 
    silent = true, // Default to silent to avoid error messages
    retryCount = 0,
    forceRefresh = false
  } = options;
  
  console.log("fetchActivitiesFromDB called with options:", options);
  
  try {
    // Mark connection test time in localStorage
    localStorage.setItem('sb-connection-test-time', Date.now().toString());
    
    if (!silent && !showToast) {
      toast.loading("Hämtar aktiviteter...");
    }
    
    if (showToast) {
      toast.loading("Hämtar färsk data från servern...", {
        id: "fetch-activities",
        duration: Infinity
      });
    }
    
    // Force fresh network request by using cache: 'no-store'
    console.log("Attempting to fetch data from database");
    
    // Create the fetch promise
    const fetchPromise = supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: true });
    
    // Add fetch timeout for very slow connections
    const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => 
      setTimeout(() => reject(new Error("Anslutningen timeout - databasförfrågan tog för lång tid")), 30000)
    );
    
    // Race the fetch against the timeout
    console.log("Starting fetch request");
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    console.log("Fetch completed, processing response");
    
    // Log diagnostic info
    localStorage.setItem('sb-activities-fetch-time', Date.now().toString());
    
    // Check if the response has a count property before accessing it
    if (response && 'count' in response) {
      const countValue = response.count;
      localStorage.setItem('sb-activities-fetch-count', String(countValue || 0));
    } else if (response && response.data) {
      localStorage.setItem('sb-activities-fetch-count', String(response.data.length || 0));
    }
    
    // Destructure response after type checking
    const { data, error } = response;
    
    // Handle potential errors
    if (error) {
      console.error("Supabase query error:", error);
      
      // Attempt retry if we haven't exceeded retry count
      if (retryCount < 3) {
        console.log(`Retry attempt ${retryCount + 1} for fetching activities`);
        
        if (showToast) {
          toast.loading(`Försöker igen (${retryCount + 1}/3)...`, {
            id: "fetch-activities"
          });
        }
        
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        
        // Recursive retry with incremented count
        return fetchActivitiesFromDB({
          showToast,
          silent: true, // Always silent on retry to avoid multiple error messages
          retryCount: retryCount + 1,
          forceRefresh: true 
        });
      }
      
      // Silently handle errors without showing toasts
      if (showToast) {
        toast.dismiss("fetch-activities");
      }
      
      // Return empty array instead of showing errors
      console.log("Using empty array due to database error");
      return [];
    }
    
    // Success! Store the fetch time for telemetry
    localStorage.setItem('sb-connection-test', 'true');
    localStorage.setItem('sb-activities-last-update', Date.now().toString());
    
    // Dismiss any loading toasts
    if (!silent) {
      toast.dismiss("fetch-activities");
      
      if (showToast && data) {
        toast.success(`Hämtade ${data.length} aktiviteter från servern`);
      } else if (showToast && (!data || data.length === 0)) {
        toast.info("Inga aktiviteter hittades i databasen");
      }
    }
    
    // Deeper logging for match data
    console.log(`Fetched ${data?.length || 0} activities from database`);
    if (data) {
      const matchActivities = data.filter(item => item.type === 'match');
      console.log(`Found ${matchActivities.length} match activities`);
      
      // Debug log a few matches to verify their data
      if (matchActivities.length > 0) {
        console.log("Sample matches:", matchActivities.slice(0, 5).map(m => ({
          id: m.id,
          name: m.name,
          type: m.type,
          homeScore: m.home_score,
          awayScore: m.away_score,
          cupId: m.cup_id,
          date: m.date
        })));
      } else {
        console.warn("No match activities found in the fetched data");
      }
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching from database:", error);
    
    // Always dismiss the loading toast
    toast.dismiss("fetch-activities");
    
    // Return empty array instead of showing errors
    return [];
  }
};
