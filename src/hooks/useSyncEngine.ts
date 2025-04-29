
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { saveActivities } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export function useSyncEngine() {
  const { toast } = useToast();
  
  useEffect(() => {
    // Sync pending updates from localStorage to the database
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
        
        // Get the current activities from the database
        const { data: activities, error: fetchError } = await supabase
          .from('activities')
          .select('*')
          .in('id', activityIds);
          
        if (fetchError) {
          console.error("Error fetching activities for sync:", fetchError);
          return;
        }
        
        if (!activities || activities.length === 0) {
          console.log("No matching activities found in database");
          return;
        }
        
        // Map the activities with the pending updates
        const activitiesToUpdate = activities.map(activity => {
          const pendingUpdate = pendingUpdates[activity.id];
          
          if (pendingUpdate) {
            return {
              ...activity,
              home_score: pendingUpdate.homeScore,
              away_score: pendingUpdate.awayScore,
              is_win: pendingUpdate.isWin,
              result: pendingUpdate.result
            };
          }
          
          return activity;
        });
        
        // Try to save the updates to the database
        for (const activity of activitiesToUpdate) {
          const { error: updateError } = await supabase
            .from('activities')
            .update({
              home_score: activity.home_score,
              away_score: activity.away_score,
              is_win: activity.is_win,
              result: activity.result
            })
            .eq('id', activity.id);
            
          if (updateError) {
            console.error(`Error syncing activity ${activity.id}:`, updateError);
          } else {
            // Remove the successful update from localStorage
            delete pendingUpdates[activity.id];
            console.log(`Successfully synced activity ${activity.id}`);
          }
        }
        
        // Update localStorage with remaining updates
        if (Object.keys(pendingUpdates).length > 0) {
          localStorage.setItem('pendingScoreUpdates', JSON.stringify(pendingUpdates));
        } else {
          localStorage.removeItem('pendingScoreUpdates');
          console.log("All pending updates synced successfully");
          toast({
            title: "Synkronisering slutförd",
            description: "Alla lokala ändringar har synkroniserats till databasen."
          });
        }
      } catch (error) {
        console.error("Error syncing pending updates:", error);
      }
    };
    
    // Run sync on startup and every 5 minutes
    syncPendingUpdates();
    const intervalId = setInterval(syncPendingUpdates, 5 * 60 * 1000);
    
    // Listen for online events to trigger sync
    const handleOnline = () => {
      console.log("Network connection restored, syncing pending updates...");
      syncPendingUpdates();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
    };
  }, [toast]);
  
  return null;
}
