
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export function useSyncEngine() {
  const { toast } = useToast();
  
  useEffect(() => {
    // Sync pending updates from localStorage to the database
    const syncPendingUpdates = async () => {
      try {
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
        
        // Check for active user session before proceeding
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No active session, sync will be performed when user logs in");
          return;
        }
        
        // Process each pending update
        let successCount = 0;
        let failureCount = 0;
        
        for (const activityId of activityIds) {
          const pendingUpdate = pendingUpdates[activityId];
          
          try {
            // Try all these approaches in sequence for maximum reliability
            
            // APPROACH 1: Direct REST API call with auth token
            console.log(`Syncing activity ${activityId} via direct REST API`);
            
            const token = session.access_token;
            
            const apiUrl = `https://zkrruihxszziifyogzko.supabase.co/rest/v1/activities?id=eq.${activityId}`;
            
            // First check if the activity exists
            const checkResponse = await fetch(`${apiUrl}&select=id`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U',
                'Authorization': `Bearer ${token}`,
              }
            });
            
            if (!checkResponse.ok) {
              console.error(`Activity ${activityId} check failed:`, await checkResponse.text());
              failureCount++;
              continue;
            }
            
            const checkData = await checkResponse.json();
            if (!checkData.length) {
              console.error(`Activity ${activityId} not found`);
              failureCount++;
              continue;
            }
            
            // Once we confirmed the activity exists, update it
            const response = await fetch(apiUrl, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U',
                'Authorization': `Bearer ${token}`,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                home_score: pendingUpdate.homeScore,
                away_score: pendingUpdate.awayScore,
                is_win: pendingUpdate.isWin,
                result: pendingUpdate.result,
                player_stats: {
                  goals: {},
                  assists: {},
                  scores: {
                    home: pendingUpdate.homeScore,
                    away: pendingUpdate.awayScore
                  },
                  isWin: pendingUpdate.isWin,
                  cup_matches: [],
                  matches: 0,
                  wins: 0,
                  draws: 0,
                  losses: 0
                }
              })
            });
            
            if (response.ok) {
              // Remove successfully synced update
              delete pendingUpdates[activityId];
              successCount++;
              console.log(`Successfully synced activity ${activityId} via direct REST API`);
              continue;
            }
            
            console.warn(`Failed to sync activity ${activityId}:`, await response.text());
            
            // APPROACH 2: Use Supabase client as fallback
            try {
              console.log(`Trying Supabase client for activity ${activityId}`);
              
              const { error } = await supabase
                .from('activities')
                .update({
                  home_score: pendingUpdate.homeScore,
                  away_score: pendingUpdate.awayScore,
                  is_win: pendingUpdate.isWin,
                  result: pendingUpdate.result,
                  player_stats: {
                    goals: {},
                    assists: {},
                    scores: {
                      home: pendingUpdate.homeScore,
                      away: pendingUpdate.awayScore
                    },
                    isWin: pendingUpdate.isWin,
                    cup_matches: [],
                    matches: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0
                  }
                })
                .eq('id', activityId);
                
              if (!error) {
                delete pendingUpdates[activityId];
                successCount++;
                console.log(`Successfully synced activity ${activityId} via Supabase client`);
                continue;
              }
              
              // Final approach - try with minimal update
              console.warn(`Failed with Supabase client approach:`, error);
              
              const minimalResponse = await fetch(apiUrl, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U',
                  'Authorization': `Bearer ${token}`,
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                  home_score: pendingUpdate.homeScore,
                  away_score: pendingUpdate.awayScore
                })
              });
              
              if (minimalResponse.ok) {
                delete pendingUpdates[activityId];
                successCount++;
                console.log(`Successfully synced activity ${activityId} with minimal update`);
              } else {
                failureCount++;
                console.error(`All sync attempts failed for activity ${activityId}`);
              }
              
            } catch (innerError) {
              failureCount++;
              console.error(`Error in fallback approach for activity ${activityId}:`, innerError);
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
        }
        
        // Display a toast notification with the results
        if (successCount > 0) {
          sonnerToast.success(`${successCount} matchresultat synkroniserade till databasen`);
        }
        
        if (failureCount > 0) {
          sonnerToast.warning(`Kunde inte synka ${failureCount} ändringar. Försöker igen senare.`);
        }
      } catch (error) {
        console.error("Error syncing pending updates:", error);
      }
    };
    
    // Check if we have a session before trying to sync
    const checkSessionAndSync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Active session found, initiating sync");
        syncPendingUpdates();
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
    
    // Get pending updates from localStorage
    const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
    if (!pendingUpdatesJson) {
      sonnerToast.info("Inga ändringar att synkronisera");
      return;
    }
    
    const pendingUpdates = JSON.parse(pendingUpdatesJson);
    const count = Object.keys(pendingUpdates).length;
    
    if (count > 0) {
      if (!session) {
        sonnerToast.warning("Du måste logga in för att synkronisera ändringar");
        return;
      }
      
      sonnerToast.loading(`Synkroniserar ${count} matchresultat...`);
      
      // Try to sync by forcing a page reload to trigger sync engine
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      sonnerToast.info("Inga ändringar att synkronisera");
    }
  };
  
  return { manualSync };
}
