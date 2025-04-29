
import { useState, useEffect, useCallback } from "react";
import { Activity } from "@/types/player";
import { getStoredActivities } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/lib/supabase/client";

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

  const loadActivities = useCallback(async (showToast = true) => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      // Skip database call and use cache if offline
      if (isOffline) {
        const storedActivities = await getStoredActivities();
        setActivities(storedActivities);
        if (storedActivities.length === 0) {
          setLoadError("Du är offline och inga lokalt sparade aktiviteter hittades");
        }
        setIsLoading(false);
        return;
      }
      
      // Set a timeout to detect slow connections
      const timeoutId = setTimeout(() => {
        if (isOffline) {
          sonnerToast.warning("Du verkar vara offline. Visar lokalt sparade aktiviteter.");
        } else {
          sonnerToast.warning("Databasanslutningen verkar långsam. Försöker fortsätta...");
        }
      }, 3000);
      
      // Check if we have a session first - use getSession directly with destructuring
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        // Mark connection as tested regardless of session
        localStorage.setItem('sb-connection-test', 'true');
        localStorage.setItem('sb-connection-test-time', Date.now().toString());
      } catch (sessionError) {
        console.error("Error checking session:", sessionError);
      }
      
      const storedActivities = await getStoredActivities();
      clearTimeout(timeoutId);
      
      if (storedActivities.length > 0) {
        console.log("Aktiviteter hämtade:", storedActivities.length);
        setActivities(storedActivities);
        if (showToast) {
          sonnerToast.success(`${storedActivities.length} aktiviteter hämtade`);
        }
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
    } catch (error) {
      console.error("Error loading activities:", error);
      
      // Fallback to cached data
      try {
        const cachedActivities = localStorage.getItem('cachedActivities');
        if (cachedActivities) {
          const parsedActivities = JSON.parse(cachedActivities);
          setActivities(parsedActivities);
          setLoadError("Anslutningsfel. Visar cachade aktiviteter.");
          console.log("Using cached activities due to error");
        } else {
          setLoadError(isOffline 
            ? "Du är offline. Kontrollera din nätverksanslutning och försök igen." 
            : "Ett fel uppstod när aktiviteter skulle hämtas från databasen."
          );
        }
      } catch (cacheError) {
        setLoadError("Kunde inte ladda aktiviteter. Försök igen senare.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast, isOffline]);

  useEffect(() => {
    loadActivities(false); // Don't show toast on initial load
  }, [loadActivities]);

  // Update selected activity when activities change (to get latest data)
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
