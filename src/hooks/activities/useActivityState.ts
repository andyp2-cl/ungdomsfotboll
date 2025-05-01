
import { useState, useEffect, useCallback } from "react";
import { Activity } from "@/types/player";
import { getStoredActivities } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export function useActivityState() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const { toast } = useToast();

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Reload activities when back online
      sonnerToast.info("Du är online igen! Uppdaterar data...");
      loadActivities({ forceRefresh: true, showToast: true });
    };
    const handleOffline = () => {
      setIsOffline(true);
      sonnerToast.warning("Du är nu offline. Visar cachad data.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clear API cache when needed via Service Worker
  const clearApiCache = useCallback(async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log("Sending CLEAR_API_CACHE message to service worker");
      
      return new Promise<void>((resolve) => {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data && event.data.type === 'CACHE_CLEARED') {
            console.log("Received CACHE_CLEARED confirmation from service worker");
            resolve();
          }
        };
        
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_API_CACHE',
          timestamp: Date.now()
        }, [messageChannel.port2]);
        
        // Add timeout in case service worker doesn't respond
        setTimeout(() => {
          console.log("No response from service worker, continuing anyway");
          resolve();
        }, 3000);
      });
    }
    return Promise.resolve();
  }, []);

  const loadActivities = useCallback(async (options: { 
    forceRefresh?: boolean; 
    showToast?: boolean;
    maxAttempts?: number;
  } = {}) => {
    const { 
      forceRefresh = false, 
      showToast = false,
      maxAttempts = 3
    } = options;
    
    try {
      setIsLoading(true);
      setLoadError(null);
      
      // Extra check to make sure we're connected before attempting to refresh
      if (forceRefresh && !navigator.onLine) {
        sonnerToast.warning("Du är offline. Kan inte hämta färsk data just nu.");
        setLoadError("Du är offline. Kan inte hämta färsk data just nu. Visar cachad data.");
      }
      
      // Clear API cache if forcing refresh and we're online
      if (forceRefresh && navigator.onLine) {
        await clearApiCache();
        localStorage.removeItem('cachedActivities');
        localStorage.removeItem('cachedActivitiesTime');
        localStorage.removeItem('sb-activities-fetch-time');
        setLastRefreshTime(Date.now());
        
        // Display toast that we're refreshing data
        sonnerToast.loading("Rensar cache och hämtar färsk data...", {
          id: "clear-cache",
          duration: 2000
        });
        
        // Brief delay to allow cache clearing to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Set a timeout to detect slow connections
      const timeoutId = setTimeout(() => {
        if (isOffline) {
          sonnerToast.warning("Du verkar vara offline. Visar lokalt sparade aktiviteter.");
        } else if (isLoading) {
          sonnerToast.warning("Databasanslutningen verkar långsam. Fortsätter försöka...");
        }
      }, 3000);
      
      try {
        // Log attempt
        console.log(`Loading activities with forceRefresh=${forceRefresh}, retryCount=${retryCount}`);
        
        // Try with increased priority for data freshness
        const storedActivities = await getStoredActivities({
          forceRefresh: forceRefresh || retryCount > 0,
          showToast: showToast,
          meta: { 
            priority: 'high',
            freshness: 'required'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (storedActivities && storedActivities.length > 0) {
          console.log(`Successfully loaded ${storedActivities.length} activities`);
          
          // Look specifically for match data
          const matches = storedActivities.filter(a => a.type === 'match');
          console.log(`Loaded ${matches.length} matches`);
          
          if (matches.length > 0) {
            // Log a sample to debug
            console.log("Sample match data:", matches[0]);
          } else {
            console.warn("No matches found in loaded activities");
            
            if (forceRefresh && retryCount < maxAttempts - 1) {
              // Try again with force refresh and incremented retry count
              setRetryCount(prev => prev + 1);
              setTimeout(() => {
                sonnerToast.info(`Inga matcher hittades. Försöker igen (${retryCount + 1}/${maxAttempts})...`);
                loadActivities({
                  forceRefresh: true,
                  showToast: true,
                  maxAttempts
                });
              }, 2000);
            } else {
              sonnerToast.error("Kunde inte hitta några matcher efter flera försök.");
            }
          }
          
          setActivities(storedActivities);
          setRetryCount(0); // Reset retry count on success
          
          // Cache the activities again to ensure we have the latest data
          localStorage.setItem('cachedActivities', JSON.stringify(storedActivities));
          localStorage.setItem('cachedActivitiesTime', Date.now().toString());
          localStorage.setItem('cachedActivitiesCount', storedActivities.length.toString());
        } else {
          console.warn("No activities loaded from database");
          
          // If we're below max attempts, increment retry counter and try again
          if (retryCount < maxAttempts - 1) {
            setRetryCount(prev => prev + 1);
            
            // Try again after a delay with exponential backoff
            setTimeout(() => {
              if (showToast) {
                sonnerToast.info(`Försöker hämta data igen (försök ${retryCount + 1}/${maxAttempts})...`);
              }
              loadActivities({
                forceRefresh: true,
                showToast: showToast,
                maxAttempts
              });
            }, 2000 * Math.pow(2, retryCount));
          } else if (retryCount >= maxAttempts - 1 && showToast) {
            // After maximum retries, suggest a solution
            sonnerToast.error("Kunde inte hämta aktiviteter efter flera försök", {
              description: "Prova att logga ut och in igen, eller be en administratör kontrollera databasen",
              duration: 8000
            });
            
            // Try to use cached activities as last resort
            const cachedActivitiesJson = localStorage.getItem('cachedActivities');
            if (cachedActivitiesJson) {
              try {
                const cachedActivities = JSON.parse(cachedActivitiesJson);
                console.log(`Using ${cachedActivities.length} cached activities as last resort`);
                setActivities(cachedActivities);
                
                if (showToast) {
                  sonnerToast.info("Visar cachad data eftersom ingen ny data hittades");
                }
                
                setLoadError("Kunde inte hämta färsk data. Visar cachad data.");
              } catch (e) {
                console.error("Failed to parse cached activities:", e);
              }
            }
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("Error loading activities:", error);
        
        // Fallback to cached data
        const cachedActivities = localStorage.getItem('cachedActivities');
        if (cachedActivities) {
          try {
            const parsedActivities = JSON.parse(cachedActivities);
            setActivities(parsedActivities);
            setLoadError("Anslutningsfel. Visar cachade aktiviteter.");
            
            // Check specifically for matches in cache
            const cachedMatches = parsedActivities.filter(a => a.type === 'match');
            console.log(`Found ${cachedMatches.length} matches in cache`);
            
            if (cachedMatches.length === 0) {
              console.warn("No matches in cached data");
              sonnerToast.warning("Inga matcher hittades i cachad data");
            }
          } catch (e) {
            console.error("Failed to parse cached activities:", e);
          }
        } else {
          setLoadError(isOffline 
            ? "Du är offline. Kontrollera din nätverksanslutning och försök igen." 
            : "Ett fel uppstod när aktiviteter skulle hämtas från databasen."
          );
        }
        
        // Try again if retry count not exceeded
        if (retryCount < maxAttempts - 1) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            sonnerToast.info(`Felhämtning: Försöker igen (${retryCount + 1}/${maxAttempts})...`);
            loadActivities({
              forceRefresh: true,
              showToast: true,
              maxAttempts
            });
          }, 3000 * Math.pow(2, retryCount));
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast, isOffline, retryCount, clearApiCache]);

  // Initial load
  useEffect(() => {
    loadActivities({ forceRefresh: true, showToast: true });
  }, [loadActivities]);

  // Update selected activity when activities change
  useEffect(() => {
    if (selectedActivity && activities.length > 0) {
      const updatedActivity = activities.find(a => a.id === selectedActivity.id);
      if (updatedActivity) {
        setSelectedActivity(updatedActivity);
      }
    }
  }, [activities, selectedActivity]);

  // Debug diagnostics for match data
  useEffect(() => {
    const matchActivities = activities.filter(a => a.type === 'match');
    console.log(`Current state has ${activities.length} activities, including ${matchActivities.length} matches`);
    
    if (matchActivities.length > 0) {
      console.log("Sample match:", matchActivities[0]);
    } else {
      console.warn("No matches in current activity state");
    }
  }, [activities]);

  return {
    activities,
    setActivities,
    isLoading,
    loadError,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    isOffline,
    lastRefreshTime,
    retryLoading: (showToast = true) => loadActivities({ forceRefresh: true, showToast }),
    toast
  };
}
