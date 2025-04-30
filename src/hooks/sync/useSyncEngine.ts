
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { syncPendingUpdates } from "./syncOperations";
import { handleSyncNotifications, triggerManualSync } from "./syncState";

/**
 * Hook for synchronizing local data with remote database
 */
export function useSyncEngine() {
  const { toast } = useToast();
  
  useEffect(() => {
    // Function to check session and run sync
    const checkSessionAndSync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Active session found, initiating sync");
        const { successCount, failureCount } = await syncPendingUpdates();
        handleSyncNotifications(successCount, failureCount);
      } else {
        console.log("No active session, skipping automatic sync");
      }
    };
    
    // Run sync check on startup and every minute
    checkSessionAndSync();
    const intervalId = setInterval(checkSessionAndSync, 60 * 1000);
    
    // Listen for online events to trigger sync
    const handleOnline = () => {
      console.log("Network connection restored, checking for sync");
      sonnerToast.info("Nätverk återansluten, försöker synkronisera ändringar...");
      checkSessionAndSync();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
    };
  }, [toast]);
  
  // Expose a function that can be called to manually trigger sync
  const manualSync = async () => {
    // Check if we have a session first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      sonnerToast.warning("Du måste logga in för att synkronisera ändringar");
      return;
    }
    
    // Get network status
    const isOnline = navigator.onLine;
    
    // Trigger the manual sync
    await triggerManualSync(isOnline);
  };
  
  return { manualSync };
}

// Import the sonnerToast for the component
import { toast as sonnerToast } from "sonner";
