
import { useState } from "react";
import { Activity } from "@/types/player";
import { useActivities } from "./useActivities";
import { toast } from "sonner";

export function useActivitiesManager() {
  const {
    activities,
    setActivities,
    isLoading,
    loadError,
    isRefreshing,
    refreshActivities,
    lastRefreshTime
  } = useActivities();

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([]);

  // Filtered activities based on selected types
  const filteredActivities = activities.filter(activity => {
    if (selectedActivityTypes.length === 0) return true;
    return selectedActivityTypes.includes(activity.type || "");
  });

  // Historical activities (completed ones)
  const filteredHistoricalActivities = activities.filter(activity => {
    const now = new Date();
    const activityDate = activity.date ? new Date(activity.date) : null;
    return activityDate && activityDate < now;
  });

  // Handle activity type change
  const handleActivityTypeChange = (type: string) => {
    setSelectedActivityTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // Handle activity update
  const handleActivityUpdate = async (activity: Activity): Promise<void> => {
    try {
      console.log("Updating activity:", activity);
      // For now, just update the state for demo purposes
      setActivities(prev => 
        prev.map(a => a.id === activity.id ? activity : a)
      );
      toast.success("Aktivitet uppdaterad");
    } catch (error) {
      console.error("Error updating activity:", error);
      toast.error("Kunde inte uppdatera aktivitet");
    }
  };

  // Handle kiosk assignment update
  const handleKioskAssignmentUpdate = async (activityId: string, playerId?: string): Promise<boolean> => {
    try {
      setActivities(prev => 
        prev.map(a => a.id === activityId ? { ...a, kioskPlayerId: playerId } : a)
      );
      return true;
    } catch (error) {
      console.error("Error updating kiosk assignment:", error);
      return false;
    }
  };

  // Handle activity deletion
  const handleDeleteActivity = async (activityId: string): Promise<boolean> => {
    try {
      setActivities(prev => prev.filter(a => a.id !== activityId));
      return true;
    } catch (error) {
      console.error("Error deleting activity:", error);
      return false;
    }
  };

  // Handle adding a new activity
  const handleAddActivity = async (activity: Activity): Promise<void> => {
    try {
      setActivities(prev => [...prev, activity]);
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  // Handle importing activities
  const handleImportedActivities = async (importedActivities: Activity[]): Promise<boolean> => {
    try {
      setActivities(prev => [...prev, ...importedActivities]);
      return true;
    } catch (error) {
      console.error("Error importing activities:", error);
      return false;
    }
  };

  // Handle clearing historical activities
  const handleClearHistoricalActivities = async (): Promise<boolean> => {
    try {
      const now = new Date();
      setActivities(prev => 
        prev.filter(a => {
          const activityDate = a.date ? new Date(a.date) : null;
          return !activityDate || activityDate >= now;
        })
      );
      return true;
    } catch (error) {
      console.error("Error clearing historical activities:", error);
      return false;
    }
  };

  // Handle match result update
  const handleMatchResultUpdate = async (activityId: string, homeScore?: number, awayScore?: number): Promise<void> => {
    try {
      setActivities(prev => 
        prev.map(a => {
          if (a.id === activityId) {
            return {
              ...a,
              homeScore: homeScore !== undefined ? homeScore : a.homeScore,
              awayScore: awayScore !== undefined ? awayScore : a.awayScore
            };
          }
          return a;
        })
      );
    } catch (error) {
      console.error("Error updating match result:", error);
    }
  };

  return {
    activities,
    setActivities,
    isLoading,
    loadError,
    isRefreshing,
    refreshActivities,
    lastRefreshTime,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    selectedActivityTypes,
    filteredActivities,
    filteredHistoricalActivities,
    handleActivityTypeChange,
    handleActivityUpdate,
    handleKioskAssignmentUpdate,
    handleDeleteActivity,
    handleAddActivity,
    handleImportedActivities,
    handleClearHistoricalActivities,
    handleMatchResultUpdate
  };
}
