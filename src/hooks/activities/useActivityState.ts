
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
  const { toast } = useToast();

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Reload activities when back online
      loadActivities(true);
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadActivities = useCallback(async (showToast = false) => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      // Set a timeout to detect slow connections
      const timeoutId = setTimeout(() => {
        if (isOffline) {
          sonnerToast.warning("Du verkar vara offline. Visar lokalt sparade aktiviteter.");
        } else {
          sonnerToast.warning("Databasanslutningen verkar långsam. Försöker fortsätta...");
        }
      }, 3000);
      
      // Try to load activities with forceRefresh to ensure we get fresh data
      try {
        const storedActivities = await getStoredActivities({
          forceRefresh: true,  // Force refresh from database
          showToast: showToast
        });
        clearTimeout(timeoutId);
        
        if (storedActivities.length > 0) {
          setActivities(storedActivities);
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
          } else {
            if (isOffline) {
              setLoadError("Du är offline och inga lokalt sparade aktiviteter hittades");
            } else {
              toast({
                title: "Inga aktiviteter hittades",
                description: "Inga aktiviteter hittades i databasen.",
              });
            }
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
  }, [toast, isOffline]);

  useEffect(() => {
    loadActivities(false);
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
    retryLoading: () => loadActivities(true),
    toast
  };
}
