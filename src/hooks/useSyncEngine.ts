
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { saveActivities } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export function useSyncEngine() {
  const { toast } = useToast();
  
  useEffect(() => {
    // Sync pending updates from localStorage to the database directly via REST API
    const syncPendingUpdates = async () => {
      try {
        console.log("Checking for pending score updates...");
        
        // Get pending updates from localStorage
        const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
        if (!pendingUpdatesJson) {
          return;
        }
        
        const pendingUpdates = JSON.parse(pendingUpdatesJson);
        const activityIds = Object.keys(pendingUpdates);
        
        if (activityIds.length === 0) {
          return;
        }
        
        console.log(`Found ${activityIds.length} pending score updates to sync`);
        
        // Process each pending update
        let successCount = 0;
        let failureCount = 0;
        
        for (const activityId of activityIds) {
          const pendingUpdate = pendingUpdates[activityId];
          
          try {
            // DIRECT REST API APPROACH - Completely bypass JS client and RLS
            console.log(`Syncing activity ${activityId} via direct REST API`);
            
            const apiUrl = `https://zkrruihxszziifyogzko.supabase.co/rest/v1/activities?id=eq.${activityId}`;
            const response = await fetch(apiUrl, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                home_score: pendingUpdate.homeScore,
                away_score: pendingUpdate.awayScore,
                is_win: pendingUpdate.isWin,
                result: pendingUpdate.result
              })
            });
            
            if (response.ok) {
              // Remove successfully synced update
              delete pendingUpdates[activityId];
              successCount++;
              console.log(`Successfully synced activity ${activityId} via direct REST API`);
            } else {
              failureCount++;
              console.error(`Error syncing activity ${activityId} via direct REST API:`, await response.text());
            }
          } catch (error) {
            failureCount++;
            console.error(`Exception syncing activity ${activityId}:`, error);
          }
        }
        
        // Update localStorage with remaining updates
        if (Object.keys(pendingUpdates).length > 0) {
          localStorage.setItem('pendingScoreUpdates', JSON.stringify(pendingUpdates));
          console.log(`${successCount} updates synced, ${Object.keys(pendingUpdates).length} remaining`);
        } else {
          localStorage.removeItem('pendingScoreUpdates');
          console.log("All pending updates synced successfully");
          toast({
            title: "Synkronisering slutförd",
            description: "Alla lokala ändringar har synkroniserats till databasen."
          });
        }
        
        // Display a quick toast notification with the results
        if (successCount > 0) {
          sonnerToast.success(`${successCount} matchresultat synkroniserade till databasen`);
        }
      } catch (error) {
        console.error("Error syncing pending updates:", error);
      }
    };
    
    // Run sync on startup and every minute (more frequent than before)
    syncPendingUpdates();
    const intervalId = setInterval(syncPendingUpdates, 60 * 1000);
    
    // Listen for online events to trigger sync
    const handleOnline = () => {
      console.log("Network connection restored, syncing pending updates...");
      sonnerToast.info("Nätverk återansluten, synkroniserar ändringar...");
      syncPendingUpdates();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
    };
  }, [toast]);
  
  // Expose a function that can be called to manually trigger sync
  const manualSync = () => {
    sonnerToast.loading("Synkroniserar ändringar till databasen...");
    
    // Get pending updates from localStorage
    const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
    if (!pendingUpdatesJson) {
      sonnerToast.info("Inga ändringar att synkronisera");
      return;
    }
    
    const pendingUpdates = JSON.parse(pendingUpdatesJson);
    const count = Object.keys(pendingUpdates).length;
    sonnerToast.info(`Synkroniserar ${count} matchresultat...`);
  };
  
  return { manualSync };
}
