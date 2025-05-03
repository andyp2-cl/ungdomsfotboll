
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
      setTimeout(() => reject(new Error("Anslutningen timeout - databasförfrågan tog för lång tid")), 30000)
    );
    
    // Create the actual fetch promise with cache control to ensure fresh data
    let fetchPromise;
    
    if (forceRefresh) {
      // Add cache-busting query parameter for forced refresh
      const cacheBuster = `?_cb=${Date.now()}`;
      console.log("Forcing fresh data fetch with cache-buster");
      
      fetchPromise = supabase
        .from('activities')
        .select('*', { 
          head: false, 
          count: 'exact'
        })
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
    
    // Update fetch time
    localStorage.setItem('sb-activities-fetch-time', Date.now().toString());
    localStorage.setItem('sb-activities-fetch-count', String(count || 0));
    
    // Handle errors
    if (error) {
      console.error("Supabase query error:", error);
      
      // Retry if we haven't exceeded retry count
      if (retryCount < 3) {
        console.log(`Retry attempt ${retryCount + 1} for fetching activities`);
        
        if (showToast) {
          toast.loading(`Försöker igen (${retryCount + 1}/3)...`, {
            id: "fetch-activities"
          });
        }
        
        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        
        // Recursive retry with incremented count
        return fetchActivitiesFromDB({
          showToast,
          silent,
          retryCount: retryCount + 1,
          forceRefresh: true // Always force refresh on retry
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
    
    // Success! Store test
    localStorage.setItem('sb-connection-test', 'true');
    localStorage.setItem('sb-activities-last-update', Date.now().toString());
    
    // Track match data
    const matchActivities = data?.filter(item => item.type === 'match') || [];
    localStorage.setItem('match-data-count', String(matchActivities.length));
    localStorage.setItem('match-data-last-update', Date.now().toString());
    
    // Check if we need to fetch match data specifically
    if (data && data.length > 0 && matchActivities.length === 0) {
      console.warn("No match activities found in the initial fetch, attempting specific query");
      
      try {
        const { data: matchData } = await supabase
          .from('activities')
          .select('*')
          .eq('type', 'match')
          .order('date', { ascending: true });
          
        if (matchData && matchData.length > 0) {
          console.log(`Fetched ${matchData.length} match activities specifically`);
          localStorage.setItem('match-data-count', String(matchData.length));
          
          // Merge without duplicates
          const mergedActivities = [...data];
          const existingIds = new Set(data.map(a => a.id));
          
          matchData.forEach(match => {
            if (!existingIds.has(match.id)) {
              mergedActivities.push(match);
              existingIds.add(match.id);
            }
          });
          
          // Update data
          data.length = 0;
          data.push(...mergedActivities);
        }
      } catch (err) {
        console.error("Error fetching match activities specifically:", err);
      }
    }
    
    // Dismiss loading toast
    if (!silent) {
      toast.dismiss("fetch-activities");
      
      if (showToast && data) {
        toast.success(`Hämtade ${data.length} aktiviteter från servern${matchActivities.length > 0 ? ` (${matchActivities.length} matcher)` : ''}`);
      } else if (showToast && (!data || data.length === 0)) {
        toast.info("Inga aktiviteter hittades i databasen");
      }
    }
    
    // Log and return data
    console.log(`Fetched ${data?.length || 0} activities from database`);
    if (data) {
      console.log(`Found ${matchActivities.length} match activities`);
      
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
    
    return data || [];
  } catch (error) {
    console.error("Error fetching from database:", error);
    
    toast.dismiss("fetch-activities");
    
    if (!silent && showToast) {
      toast.error(`Databasfel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    }
    
    throw error;
  }
};
