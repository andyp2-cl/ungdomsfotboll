
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
    silent = false,
    retryCount = 0,
    forceRefresh = false
  } = options;
  
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
    console.log("Forcing fresh data fetch with bypass cache technique");
    
    // Create the fetch promise with stronger cache control
    const fetchPromise = supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: true });
    
    // Add fetch timeout for very slow connections
    const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => 
      setTimeout(() => reject(new Error("Anslutningen timeout - databasförfrågan tog för lång tid")), 30000)
    );
    
    // Race the fetch against the timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Log diagnostic info
    localStorage.setItem('sb-activities-fetch-time', Date.now().toString());
    
    // Safely access count property with type checking
    const countValue = 'count' in response ? response.count : undefined;
    
    if (countValue !== undefined) {
      localStorage.setItem('sb-activities-fetch-count', String(countValue));
    } else if (response.data) {
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
          silent,
          retryCount: retryCount + 1,
          forceRefresh: true // Always force refresh on retry attempts
        });
      }
      
      if (!silent) {
        toast.dismiss("fetch-activities");
        if (showToast) {
          toast.error(`Kunde inte hämta aktiviteter: ${error.message || 'Okänt fel'}`);
        }
      }
      
      throw error;
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
    
    if (!silent && showToast) {
      toast.error(`Databasfel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    }
    
    throw error;
  }
};
