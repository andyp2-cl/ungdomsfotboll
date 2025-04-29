
import { Activity } from "@/types/player";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches activities from the database
 */
export const fetchActivitiesFromDB = async (options: { showToast?: boolean; silent?: boolean } = {}): Promise<Activity[]> => {
  const { showToast = false, silent = false } = options;
  
  // Mark connection test time in localStorage
  localStorage.setItem('sb-connection-test-time', Date.now().toString());
  
  if (!silent && !showToast) {
    toast.loading("Hämtar aktiviteter...");
  }

  // Fetching the activities from Supabase
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: true });

  // Log diagnostic info
  localStorage.setItem('sb-activities-fetch-time', Date.now().toString());
  
  // Handle potential errors
  if (error) {
    console.error("Supabase query error:", error);
    
    if (!silent) {
      toast.dismiss();
      if (showToast) {
        toast.error("Kunde inte hämta aktiviteter från databasen");
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
    }
  }

  // Return the fetched activities (or empty array if null)
  return data || [];
};
