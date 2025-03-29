
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
        const storedActivities = await getStoredActivities();
        if (storedActivities.length > 0) {
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
