
import { Activity, Player } from "@/types/player";
import { updateActivityInDatabase } from "./activityDatabaseActions";
import { saveActivities } from "@/utils/storage";
import { toast as toastLibrary } from "sonner";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { handleMatchResultUpdate } from "./match-result";
import { supabase } from "@/lib/supabase/client"; // Added missing import

/**
 * Updates an existing activity
 */
export const handleActivityUpdate = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  players: Player[],
  setPlayers: (players: Player[]) => void,
  toast: any,
  updatedActivity: Activity
): Promise<void> => {
  try {
    console.log(`Updating activity ${updatedActivity.id}: ${updatedActivity.name}`);
    
    // Directly update the local state first for immediate UI feedback
    const updatedActivities = activities.map(a => 
      a.id === updatedActivity.id ? updatedActivity : a
    );
    
    // Update React state
    setActivities(updatedActivities);
    
    // Try to update in database
    let success = await updateActivityInDatabase(updatedActivity);

    // If all database updates failed, try fallback with storage system
    if (!success) {
      try {
        console.log("Attempting to save with storage system...");
        success = await saveActivities(updatedActivities);
        
        if (success) {
          console.log("Activity saved successfully via enhanced storage system");
          
          // Force refresh local cache to ensure data consistency
          localStorage.removeItem('cachedActivities');
          localStorage.removeItem('sb-activities-fetch-time');
          console.log("Cleared local cache after successful storage update");
          
          toastLibrary.success("Aktivitet uppdaterad lokalt");
          return;
        }
      } catch (saveError) {
        console.error("Enhanced storage system failed:", saveError);
      }
    }
    
    // If we reach here with success = true, one of the methods worked
    if (success) {
      // Additional cache clearing to ensure fresh data loads on next fetch
      localStorage.removeItem('cachedActivities');
      localStorage.removeItem('sb-activities-fetch-time');
      sessionStorage.removeItem('activities-cache');
      
      // Add a message to console to track successful saves
      console.log(`Successfully updated activity ${updatedActivity.id}: ${updatedActivity.name}`);
      
      toastLibrary.success("Aktivitet uppdaterad");
      return;
    }
    
    console.error("All update methods failed for activity", updatedActivity.id);
    toastLibrary.error("Kunde inte uppdatera aktiviteten");
  } catch (error) {
    console.error("Error handling activity update:", error);
    toastLibrary.error("Ett fel uppstod vid uppdatering av aktiviteten");
  }
};

/**
 * Updates the kiosk assignment for an activity
 */
export const handleKioskAssignmentUpdate = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  activityId: string,
  playerId?: string
): Promise<boolean> => {
  try {
    console.log(`Updating kiosk assignment for activity ${activityId} to player ${playerId}`);
    
    // Find the activity to update
    const activity = activities.find(a => a.id === activityId);
    if (!activity) {
      console.error(`Activity with id ${activityId} not found`);
      toast({
        title: "Kunde inte hitta aktiviteten",
        description: "Aktiviteten kunde inte hittas i systemet.",
        variant: "destructive"
      });
      return false;
    }
    
    // Create updated activity
    const updatedActivity = {
      ...activity,
      kioskAssignedPlayerId: playerId
    };
    
    // Directly update the local state first for immediate UI feedback
    const updatedActivities = activities.map(a =>
      a.id === activityId ? updatedActivity : a
    );
    setActivities(updatedActivities);
    
    // Try to update in database
    const success = await updateActivityInDatabase(updatedActivity);
    
    if (success) {
      toast({
        title: "Kiosk tilldelad",
        description: `Kiosk har tilldelats till spelare ${playerId || 'ingen'}`,
      });
      return true;
    } else {
      toast({
        title: "Kunde inte tilldela kiosk",
        description: "Ett fel uppstod när kiosken skulle tilldelas. Försök igen.",
        variant: "destructive"
      });
      return false;
    }
  } catch (error) {
    console.error("Error handling kiosk assignment update:", error);
    toast({
      title: "Kunde inte tilldela kiosk",
      description: "Ett fel uppstod när kiosken skulle tilldelas. Försök igen.",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Adds a new activity
 */
export const handleAddActivity = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  newActivity: Activity
): Promise<void> => {
  try {
    console.log(`Adding new activity ${newActivity.id}: ${newActivity.name}`);
    
    // Optimistically update the local state first for immediate UI feedback
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    
    // Format the activity for database
    const formattedActivity = formatActivityForDatabase(newActivity);
    
    // Try to add in database
    let success = false;
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert(formattedActivity)
        .select();
      
      if (error) {
        console.error("Error adding activity to database:", error);
      } else {
        success = true;
        console.log("Activity added to database successfully:", data);
        
        // Log the change
        await logDatabaseChange(
          'create',
          'activity',
          newActivity.id,
          `Activity created: ${newActivity.name}`
        );
      }
    } catch (dbError) {
      console.error("Database error adding activity:", dbError);
    }
    
    // If database update failed, save to local storage
    if (!success) {
      try {
        await saveActivities(updatedActivities);
        console.log("Activity saved to local storage");
      } catch (saveError) {
        console.error("Error saving activity to local storage:", saveError);
      }
    }
    
    // Force refresh local cache to ensure data consistency
    localStorage.removeItem('cachedActivities');
    localStorage.removeItem('sb-activities-fetch-time');
    
    toast({
      title: "Aktivitet tillagd",
      description: "Aktiviteten har lagts till.",
    });
  } catch (error) {
    console.error("Error handling activity addition:", error);
    toast({
      title: "Kunde inte lägga till aktivitet",
      description: "Ett fel uppstod när aktiviteten skulle läggas till. Försök igen.",
      variant: "destructive"
    });
  }
};

// Export the handleMatchResultUpdate function from the dedicated module
export { handleMatchResultUpdate };

