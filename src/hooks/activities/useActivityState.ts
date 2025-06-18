import { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { getStoredActivities } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export function useActivityState() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadActivities = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const storedActivities = await getStoredActivities();
        
        // Only update state if component is still mounted
        if (!isMounted) return;

        if (!Array.isArray(storedActivities)) {
          console.error("Stored activities is not an array:", storedActivities);
          throw new Error("Ogiltig data från databasen");
        }
        
        if (storedActivities.length > 0) {
          // Log some activities to check if they have match results
          console.log("Sample activities with match results:", 
            storedActivities
              .filter(a => a.type === 'match' && (a.homeScore !== undefined || a.awayScore !== undefined))
              .slice(0, 3)
              .map(a => ({
                id: a.id, 
                name: a.name, 
                homeScore: a.homeScore, 
                awayScore: a.awayScore,
                isWin: a.isWin,
                result: a.result
              }))
          );
          
          setActivities(storedActivities);
        } else {
          setActivities([]);
          toast({
            title: "Inga aktiviteter hittades",
            description: "Inga aktiviteter hittades i databasen.",
          });
        }
      } catch (error) {
        console.error("Error loading activities:", error);
        setLoadError(error as Error);
        toast({
          title: "Kunde inte ladda aktiviteter",
          description: error instanceof Error ? error.message : "Ett fel uppstod när aktiviteter skulle hämtas från databasen.",
          variant: "destructive"
        });
        // Set activities to empty array on error to prevent undefined issues
        setActivities([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadActivities();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Update selected activity when activities change (to get latest data)
  useEffect(() => {
    if (selectedActivity && activities.length > 0) {
      const updatedActivity = activities.find(a => a.id === selectedActivity.id);
      if (updatedActivity) {
        setSelectedActivity(updatedActivity);
      }
    }
  }, [activities, selectedActivity]);

  // Function to retry loading if there was an error
  const retryLoad = () => {
    setLoadError(null);
    setIsLoading(true);
    // This will trigger the useEffect again
  };

  return {
    activities,
    setActivities,
    isLoading,
    loadError,
    retryLoad,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    toast
  };
}
