
import { useState, useEffect, useCallback } from "react";
import { Activity } from "@/types/player";
import { getStoredActivities } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { clearActivitiesCache } from "@/utils/storage/activity/cache-operations";

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
      
      // Clear API cache if forcing refresh
      if (forceRefresh) {
        // Clear local storage cache for activities
        clearActivitiesCache();
        
        // Also clear service worker cache if available
        await clearApiCache();
        setLastRefreshTime(Date.now());
      }
      
      // Set a timeout to detect slow connections
      const timeoutId = setTimeout(() => {
        if (isOffline) {
          sonnerToast.warning("Du verkar vara offline. Visar lokalt sparade aktiviteter.");
        } else if (isLoading) {
          sonnerToast.warning("Databasanslutningen verkar långsam. Fortsätter försöka...");
        }
      }, 3000);
      
      console.log(`Loading activities with forceRefresh=${forceRefresh}, retryCount=${retryCount}`);
      
      try {
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
          }
          
          // Set activities in state
          setActivities(storedActivities);
          setRetryCount(0); // Reset retry count on success
          
          // Cache the activities again to ensure we have the latest data
          localStorage.setItem('cachedActivities', JSON.stringify(storedActivities));
          localStorage.setItem('cachedActivitiesTime', Date.now().toString());
          localStorage.setItem('cachedActivitiesCount', storedActivities.length.toString());
        } else {
          console.warn("No activities loaded from database");
          
          // Try to get cached activities
          const cachedActivitiesJson = localStorage.getItem('cachedActivities');
          if (cachedActivitiesJson) {
            try {
              const cachedActivities = JSON.parse(cachedActivitiesJson);
              console.log(`Using ${cachedActivities.length} cached activities`);
              setActivities(cachedActivities);
              
              if (showToast) {
                sonnerToast.info("Visar cachad data eftersom ingen ny data hittades");
              }
              
              setLoadError("Inga nya aktiviteter hittades. Visar cachade aktiviteter.");
            } catch (e) {
              console.error("Failed to parse cached activities:", e);
              setLoadError("Fel vid läsning av cachad data.");
            }
          } else {
            setLoadError(isOffline 
              ? "Du är offline och inga lokalt sparade aktiviteter hittades"
              : "Inga aktiviteter hittades i databasen eller i lokal cache."
            );
            setActivities([]);
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
          } catch (e) {
            console.error("Failed to parse cached activities:", e);
            setLoadError("Fel vid läsning av cachad data.");
          }
        } else {
          setLoadError(isOffline 
            ? "Du är offline. Kontrollera din nätverksanslutning och försök igen." 
            : "Ett fel uppstod när aktiviteter skulle hämtas från databasen."
          );
          setActivities([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast, isOffline, retryCount, clearApiCache]);

  // Initial load
  useEffect(() => {
    loadActivities({ forceRefresh: false, showToast: false });
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
