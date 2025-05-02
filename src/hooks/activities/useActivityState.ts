
import { useState, useEffect, useCallback } from "react";
import { Activity } from "@/types/player";
import { getStoredActivities } from "@/utils/storage";
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

  // Force initial data reload when component mounts
  useEffect(() => {
    // Clear any cached data indicators
    localStorage.removeItem('sb-activities-fetch-time');
    localStorage.removeItem('sb-activities-last-update');
    localStorage.removeItem('cachedActivities');
    localStorage.removeItem('cachedActivitiesTime');
    
    // Force a fresh data load
    loadActivities({ forceRefresh: true, showToast: true });
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
          console.log(`Loaded ${storedActivities.length} activities`);
          
          // Log match data specifically
          const matchActivities = storedActivities.filter(a => a.type === 'match');
          console.log(`Found ${matchActivities.length} match activities in loaded data`);
          
          setActivities(storedActivities);
          setIsLoading(false);
          setRetryCount(0); // Reset retry count on success
        } else {
          console.warn("No activities found in storage");
          
          if (retryCount < maxAttempts) {
            // Retry with incremented count
            setRetryCount(prev => prev + 1);
            sonnerToast.loading(`Inga aktiviteter hittades. Försöker igen (${retryCount + 1}/${maxAttempts})...`, {
              id: "loading-retry",
              duration: 2000
            });
            
            // Wait with exponential backoff before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
            
            // Recursive retry with force refresh
            return loadActivities({
              forceRefresh: true,
              showToast: true,
              maxAttempts
            });
          } else {
            setActivities([]);
            setLoadError(`Kunde inte hitta några aktiviteter efter ${maxAttempts} försök.`);
            sonnerToast.error(`Kunde inte hitta några aktiviteter efter ${maxAttempts} försök.`);
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error("Error loading activities:", fetchError);
        
        if (retryCount < maxAttempts) {
          // Retry with incremented count
          setRetryCount(prev => prev + 1);
          sonnerToast.loading(`Ett fel uppstod. Försöker igen (${retryCount + 1}/${maxAttempts})...`, {
            id: "loading-retry",
            duration: 2000
          });
          
          // Wait with exponential backoff before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          
          // Recursive retry with force refresh
          return loadActivities({
            forceRefresh: true,
            showToast: true,
            maxAttempts
          });
        } else {
          setLoadError(fetchError instanceof Error ? fetchError.message : "Okänt fel vid hämtning av data");
          sonnerToast.error(`Misslyckades efter ${maxAttempts} försök: ${fetchError instanceof Error ? fetchError.message : "Okänt fel"}`);
        }
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error in loadActivities:", error);
      setIsLoading(false);
      setLoadError(error instanceof Error ? error.message : "Ett oväntat fel uppstod");
      sonnerToast.error("Ett oväntat fel uppstod vid laddning av aktiviteter");
    }
  }, [clearApiCache, isOffline, isLoading, retryCount]);
  
  return {
    activities,
    setActivities,
    isLoading,
    setIsLoading,
    loadError,
    setLoadError,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    loadActivities,
    isOffline,
    lastRefreshTime
  };
}
