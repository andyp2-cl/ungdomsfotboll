
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
    const handleOnline = () => setIsOffline(false);
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
      
      // Set a timeout to detect slow connections
      const timeoutId = setTimeout(() => {
        if (isOffline) {
          sonnerToast.warning("Du verkar vara offline. Visar lokalt sparade aktiviteter.");
        } else {
          sonnerToast.warning("Databasanslutningen verkar långsam. Försöker fortsätta...");
        }
      }, 3000);
      
      const storedActivities = await getStoredActivities();
      clearTimeout(timeoutId);
      
      if (storedActivities.length > 0) {
        // Log some activities to check if they have match results
        console.log("Aktiviteter hämtade från databasen:", storedActivities.length);
        
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
      setLoadError(isOffline 
        ? "Du är offline. Kontrollera din nätverksanslutning och försök igen." 
        : "Ett fel uppstod när aktiviteter skulle hämtas från databasen."
      );
      toast({
        title: "Kunde inte ladda aktiviteter",
        description: "Ett fel uppstod när aktiviteter skulle hämtas från databasen.",
        variant: "destructive"
      });
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
