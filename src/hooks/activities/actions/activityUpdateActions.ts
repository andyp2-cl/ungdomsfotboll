import { Activity, Player } from "@/types/player";
import { updateActivityInDatabase } from "./activityDatabaseActions";
import { saveActivities } from "@/utils/storage";
import { toast as toastLibrary } from "sonner";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { handleMatchResultUpdate } from "./match-result";

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
 * Deletes an activity
 */
export const handleDeleteActivity = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  players: Player[],
  setPlayers: (players: Player[]) => void,
  toast: any,
  activityId: string
): Promise<boolean> => {
  try {
    console.log(`Deleting activity ${activityId}`);
    
    // Optimistically update the local state first for immediate UI feedback
    const updatedActivities = activities.filter(a => a.id !== activityId);
    setActivities(updatedActivities);
    
    // Remove activity from players
    const updatedPlayers = players.map(player => ({
      ...player,
      activities: player.activities ? player.activities.filter(id => id !== activityId) : []
    }));
    setPlayers(updatedPlayers);
    
    // Try to delete in database
    // Implementation would go here
    
    toast({
      title: "Aktivitet borttagen",
      description: "Aktiviteten har tagits bort.",
    });
    
    return true;
  } catch (error) {
    console.error("Error handling activity deletion:", error);
    toast({
      title: "Kunde inte ta bort aktivitet",
      description: "Ett fel uppstod när aktiviteten skulle tas bort. Försök igen.",
      variant: "destructive"
    });
    return false;
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
    
    // Directly update the local state first for immediate UI feedback
    const updatedActivities = activities.map(a =>
      a.id === activityId ? { ...a, kioskAssignedPlayerId: playerId } : a
    );
    setActivities(updatedActivities);
    
    // Try to update in database
    // Implementation would go here
    
    toast({
      title: "Kiosk tilldelad",
      description: `Kiosk har tilldelats till spelare ${playerId || 'ingen'}`,
    });
    
    return true;
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
    
    // Try to add in database
    // Implementation would go here
    
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

/**
 * Imports multiple activities
 */
export const handleImportedActivities = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  importedActivities: Activity[]
): Promise<void> => {
  try {
    console.log(`Importing ${importedActivities.length} activities`);
    
    // Optimistically update the local state first for immediate UI feedback
    const updatedActivities = [...activities, ...importedActivities];
    setActivities(updatedActivities);
    
    // Try to add in database
    // Implementation would go here
    
    toast({
      title: "Aktiviteter importerade",
      description: `${importedActivities.length} aktiviteter har importerats.`,
    });
  } catch (error) {
    console.error("Error handling activity import:", error);
    toast({
      title: "Kunde inte importera aktiviteter",
      description: "Ett fel uppstod när aktiviteterna skulle importeras. Försök igen.",
      variant: "destructive"
    });
  }
};

/**
 * Scrapes new matches
 */
export const handleScrapedMatches = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  newActivities: Activity[],
  clearExisting: boolean = false
): Promise<void> => {
  try {
    console.log(`Scraping ${newActivities.length} matches, clearing existing: ${clearExisting}`);
    
    // Optimistically update the local state first for immediate UI feedback
    const updatedActivities = clearExisting ? [...newActivities] : [...activities, ...newActivities];
    setActivities(updatedActivities);
    
    // Try to add in database
    // Implementation would go here
    
    toast({
      title: "Matcher skrapade",
      description: `${newActivities.length} matcher har skrapats.`,
    });
  } catch (error) {
    console.error("Error handling activity scraping:", error);
    toast({
      title: "Kunde inte skrapa matcher",
      description: "Ett fel uppstod när matcherna skulle skrapas. Försök igen.",
      variant: "destructive"
    });
  }
};

/**
 * Clears historical activities
 */
export const handleClearHistoricalActivities = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  players: Player[],
  setPlayers: (players: Player[]) => void,
  toast: any,
  currentActivities: Activity[],
  historicalActivities: Activity[]
): Promise<void> => {
  try {
    console.log(`Clearing ${historicalActivities.length} historical activities`);
    
    // Optimistically update the local state first for immediate UI feedback
    const updatedActivities = currentActivities;
    setActivities(updatedActivities);
    
    // Remove historical activities from players
    const updatedPlayers = players.map(player => ({
      ...player,
      activities: player.activities ? player.activities.filter(id => currentActivities.map(a => a.id).includes(id)) : []
    }));
    setPlayers(updatedPlayers);
    
    // Try to delete in database
    // Implementation would go here
    
    toast({
      title: "Historiska aktiviteter rensade",
      description: `${historicalActivities.length} historiska aktiviteter har rensats.`,
    });
  } catch (error) {
    console.error("Error handling historical activity clearing:", error);
    toast({
      title: "Kunde inte rensa historiska aktiviteter",
      description: "Ett fel uppstod när de historiska aktiviteterna skulle rensas. Försök igen.",
      variant: "destructive"
    });
  }
};

// Export the handleMatchResultUpdate function from the new dedicated module
export { handleMatchResultUpdate };
