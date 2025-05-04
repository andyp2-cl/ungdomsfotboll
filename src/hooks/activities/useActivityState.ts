
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
  const { toast } = useToast();

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true);
        const storedActivities = await getStoredActivities();
        
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
          toast({
            title: "Inga aktiviteter hittades",
            description: "Inga aktiviteter hittades i databasen.",
          });
        }
      } catch (error) {
        console.error("Error loading activities:", error);
        toast({
          title: "Kunde inte ladda aktiviteter",
          description: "Ett fel uppstod när aktiviteter skulle hämtas från databasen.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
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

  return {
    activities,
    setActivities,
    isLoading,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    toast
  };
}
