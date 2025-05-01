
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
  const [retryCount, setRetryCount] = useState(0); // Add retry counter
  const { toast } = useToast();

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Reload activities when back online
      loadActivities({ forceRefresh: true, showToast: true });
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clear API cache when needed via Service Worker
  const clearApiCache = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_API_CACHE'
      });
      
      return new Promise<void>((resolve) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.data && event.data.type === 'CACHE_CLEARED') {
            navigator.serviceWorker.removeEventListener('message', handleMessage);
            resolve();
          }
        };
        
        navigator.serviceWorker.addEventListener('message', handleMessage);
        
        // Add timeout in case service worker doesn't respond
        setTimeout(() => {
          navigator.serviceWorker.removeEventListener('message', handleMessage);
          resolve();
        }, 3000);
      });
    }
    return Promise.resolve();
  }, []);

  const loadActivities = useCallback(async (options: { forceRefresh?: boolean; showToast?: boolean } = {}) => {
    const { forceRefresh = false, showToast = false } = options;
    
    try {
      setIsLoading(true);
      setLoadError(null);
      
      // Clear API cache if forcing refresh
      if (forceRefresh) {
        await clearApiCache();
      }
      
      // Set a timeout to detect slow connections
      const timeoutId = setTimeout(() => {
        if (isOffline) {
          sonnerToast.warning("Du verkar vara offline. Visar lokalt sparade aktiviteter.");
        } else if (isLoading) {
          sonnerToast.warning("Databasanslutningen verkar långsam. Fortsätter försöka...");
        }
      }, 3000);
      
      // Try to load activities with forceRefresh to ensure we get fresh data
      try {
        // Attempt to load activities with increased retry count
        const storedActivities = await getStoredActivities({
          forceRefresh: forceRefresh || retryCount > 0,
          showToast: showToast
        });
        clearTimeout(timeoutId);
        
        if (storedActivities.length > 0) {
          setActivities(storedActivities);
          setRetryCount(0); // Reset retry count on success
          
          if (showToast) {
            sonnerToast.success(`${storedActivities.length} aktiviteter hämtade`);
          }
          
          // Cache the activities again to ensure we have the latest data
          localStorage.setItem('cachedActivities', JSON.stringify(storedActivities));
          localStorage.setItem('cachedActivitiesTime', Date.now().toString());
        } else {
          // Try to get cached activities
          const cachedActivitiesJson = localStorage.getItem('cachedActivities');
          if (cachedActivitiesJson) {
            const cachedActivities = JSON.parse(cachedActivitiesJson);
            setActivities(cachedActivities);
            setLoadError("Inga nya aktiviteter hittades. Visar cachade aktiviteter.");
            
            // If we see empty results and have cached activities, increment retry counter
            setRetryCount(prev => prev + 1);
            
            if (retryCount >= 2 && showToast) {
              // After multiple retries, suggest a solution
              sonnerToast.error("Kunde inte hämta nya aktiviteter efter flera försök", {
                description: "Prova att logga ut och in igen, eller be en administratör kontrollera databasen",
                duration: 8000
              });
            }
          } else if (isOffline) {
            setLoadError("Du är offline och inga lokalt sparade aktiviteter hittades");
          } else {
            toast({
              title: "Inga aktiviteter hittades",
              description: "Inga aktiviteter hittades i databasen.",
            });
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("Error loading activities:", error);
        
        // Fallback to cached data
        const cachedActivities = localStorage.getItem('cachedActivities');
        if (cachedActivities) {
          setActivities(JSON.parse(cachedActivities));
          setLoadError("Anslutningsfel. Visar cachade aktiviteter.");
        } else {
          setLoadError(isOffline 
            ? "Du är offline. Kontrollera din nätverksanslutning och försök igen." 
            : "Ett fel uppstod när aktiviteter skulle hämtas från databasen."
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast, isOffline, isLoading, retryCount, clearApiCache]);

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
    retryLoading: (showToast = true) => loadActivities({ forceRefresh: true, showToast }),
    toast
  };
}
