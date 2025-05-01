
import { Activity } from "@/types/player";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

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
    
    // Add a timeout to detect very slow connections
    const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => 
      setTimeout(() => reject(new Error("Anslutningen timeout - databasförfrågan tog för lång tid")), 20000)
    );
    
    // Create the actual fetch promise with cache control headers
    let fetchPromise;
    
    if (forceRefresh) {
      // Add cache-busting query parameter for forced refresh
      const cacheBuster = `?_cb=${Date.now()}`;
      fetchPromise = supabase
        .from('activities')
        .select('*', { head: false, count: 'exact' })
        .order('date', { ascending: true });
    } else {
      // Regular fetch
      fetchPromise = supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: true });
    }
    
    // Race the fetch against the timeout
    const { data, error, count } = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Log diagnostic info
    localStorage.setItem('sb-activities-fetch-time', Date.now().toString());
    localStorage.setItem('sb-activities-fetch-count', String(count || 0));
    
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
          forceRefresh
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
    
    // Validate and log the returned data
    console.log(`Fetched ${data?.length || 0} activities from database`);
    if (data) {
      const matchActivities = data.filter(item => item.type === 'match');
      console.log(`Found ${matchActivities.length} match activities`);
      
      // Log some samples to debug
      if (matchActivities.length > 0) {
        console.log("Sample matches:", matchActivities.slice(0, 3).map(m => ({
          id: m.id,
          name: m.name,
          type: m.type,
          home_score: m.home_score,
          away_score: m.away_score,
          cup_id: m.cup_id
        })));
      }
    }
    
    // If we get here with no data, just return an empty array instead of null
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
