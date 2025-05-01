
import { Activity } from "@/types/player";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

/**
 * Fetches activities from the database with improved error handling
 */
export const fetchActivitiesFromDB = async (options: { showToast?: boolean; silent?: boolean } = {}): Promise<Activity[]> => {
  const { showToast = false, silent = false } = options;
  
  try {
    // Mark connection test time in localStorage
    localStorage.setItem('sb-connection-test-time', Date.now().toString());
    
    if (!silent && !showToast) {
      toast.loading("Hämtar aktiviteter...");
    }
    
    // Add a timeout to detect very slow connections
    const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => 
      setTimeout(() => reject(new Error("Anslutningen timeout - databasförfrågan tog för lång tid")), 15000)
    );
    
    // Create the actual fetch promise
    const fetchPromise = supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: true });
    
    // Race the fetch against the timeout
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Log diagnostic info
    localStorage.setItem('sb-activities-fetch-time', Date.now().toString());
    
    // Handle potential errors
    if (error) {
      console.error("Supabase query error:", error);
      
      if (!silent) {
        toast.dismiss();
        if (showToast) {
          toast.error(`Kunde inte hämta aktiviteter: ${error.message || 'Okänt fel'}`);
        }
      }
      
      throw error;
    }
    
    // Success! Store the fetch time for telemetry
    localStorage.setItem('sb-connection-test', 'true');
    
    // Dismiss any loading toasts
    if (!silent) {
      toast.dismiss();
      
      if (showToast && data) {
        toast.success(`Hämtade ${data.length} aktiviteter`);
      } else if (showToast && (!data || data.length === 0)) {
        toast.info("Inga aktiviteter hittades i databasen");
      }
    }
    
    // If we get here with no data, just return an empty array instead of null
    return data || [];
  } catch (error) {
    console.error("Error fetching from database:", error);
    
    if (!silent && showToast) {
      toast.error(`Databasfel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    }
    
    throw error;
  }
};
