
import { Activity, Player } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { toast as toastLibrary } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity";
import { logDatabaseChange } from "@/lib/supabase/logs";

/**
 * Imports multiple activities
 */
export const handleImportedActivities = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  importedActivities: Activity[]
): Promise<boolean> => {
  try {
    console.log(`Importing ${importedActivities.length} activities`);
    
    // Optimistically update the local state first for immediate UI feedback
    const updatedActivities = [...activities, ...importedActivities];
    setActivities(updatedActivities);
    
    // Try to add in database
    let success = false;
    try {
      // Format activities for database
      const formattedActivities = importedActivities.map(formatActivityForDatabase);
      
      const { data, error } = await supabase
        .from('activities')
        .insert(formattedActivities)
        .select();
      
      if (error) {
        console.error("Error adding imported activities to database:", error);
      } else {
        success = true;
        console.log(`${data.length} activities imported to database successfully`);
        
        // Log the change
        await logDatabaseChange(
          'create',
          'activities',
          'batch',
          `${importedActivities.length} activities imported`
        );
      }
    } catch (dbError) {
      console.error("Database error importing activities:", dbError);
    }
    
    // If database update failed, save to local storage
    if (!success) {
      try {
        await saveActivities(updatedActivities);
        console.log("Activities saved to local storage");
        success = true;
      } catch (saveError) {
        console.error("Error saving activities to local storage:", saveError);
      }
    }
    
    // Force refresh local cache to ensure data consistency
    localStorage.removeItem('cachedActivities');
    localStorage.removeItem('sb-activities-fetch-time');
    
    toast({
      title: "Aktiviteter importerade",
      description: `${importedActivities.length} aktiviteter har importerats.`,
    });
    
    return success;
  } catch (error) {
    console.error("Error handling activity import:", error);
    toast({
      title: "Kunde inte importera aktiviteter",
      description: "Ett fel uppstod när aktiviteterna skulle importeras. Försök igen.",
      variant: "destructive"
    });
    return false;
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
): Promise<boolean> => {
  try {
    console.log(`Scraping ${newActivities.length} matches, clearing existing: ${clearExisting}`);
    
    // Optimistically update the local state first for immediate UI feedback
    const updatedActivities = clearExisting ? [...newActivities] : [...activities, ...newActivities];
    setActivities(updatedActivities);
    
    // Try to add in database
    let success = false;
    try {
      // If clearing existing, delete all activities first
      if (clearExisting) {
        const { error: deleteError } = await supabase
          .from('activities')
          .delete()
          .neq('id', 'dummy'); // This effectively means "delete all"
        
        if (deleteError) {
          console.error("Error clearing existing activities:", deleteError);
          // Continue anyway
        } else {
          console.log("Existing activities cleared successfully");
        }
      }
      
      // Format activities for database
      const formattedActivities = newActivities.map(formatActivityForDatabase);
      
      const { data, error } = await supabase
        .from('activities')
        .insert(formattedActivities)
        .select();
      
      if (error) {
        console.error("Error adding scraped matches to database:", error);
      } else {
        success = true;
        console.log(`${data.length} scraped matches added to database successfully`);
        
        // Log the change
        await logDatabaseChange(
          'create',
          'activities',
          'batch',
          `${newActivities.length} scraped matches added${clearExisting ? ' (cleared existing)' : ''}`
        );
      }
    } catch (dbError) {
      console.error("Database error adding scraped matches:", dbError);
    }
    
    // If database update failed, save to local storage
    if (!success) {
      try {
        await saveActivities(updatedActivities);
        console.log("Scraped matches saved to local storage");
        success = true;
      } catch (saveError) {
        console.error("Error saving scraped matches to local storage:", saveError);
      }
    }
    
    // Force refresh local cache to ensure data consistency
    localStorage.removeItem('cachedActivities');
    localStorage.removeItem('sb-activities-fetch-time');
    
    toast({
      title: "Matcher skrapade",
      description: `${newActivities.length} matcher har skrapats.`,
    });
    
    return success;
  } catch (error) {
    console.error("Error handling match scraping:", error);
    toast({
      title: "Kunde inte skrapa matcher",
      description: "Ett fel uppstod när matcherna skulle skrapas. Försök igen.",
      variant: "destructive"
    });
    return false;
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
): Promise<boolean> => {
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
    let success = false;
    try {
      const historicalIds = historicalActivities.map(a => a.id);
      
      // First delete player-activity relations
      for (const activityId of historicalIds) {
        const { error: relationsError } = await supabase
          .from('player_activities')
          .delete()
          .eq('activity_id', activityId);
        
        if (relationsError) {
          console.error(`Error deleting player-activity relations for activity ${activityId}:`, relationsError);
          // Continue anyway
        }
      }
      
      // Then delete the activities themselves
      for (const activityId of historicalIds) {
        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', activityId);
        
        if (error) {
          console.error(`Error deleting historical activity ${activityId}:`, error);
          // Continue to the next one
        }
      }
      
      console.log(`Attempted to delete ${historicalIds.length} historical activities from database`);
      success = true;
      
      // Log the change
      await logDatabaseChange(
        'delete',
        'activities',
        'batch',
        `${historicalIds.length} historical activities cleared`
      );
    } catch (dbError) {
      console.error("Database error clearing historical activities:", dbError);
    }
    
    // If database update failed, save to local storage
    if (!success) {
      try {
        await saveActivities(updatedActivities);
        console.log("Updated activities saved to local storage");
        success = true;
      } catch (saveError) {
        console.error("Error saving updated activities to local storage:", saveError);
      }
    }
    
    // Force refresh local cache to ensure data consistency
    localStorage.removeItem('cachedActivities');
    localStorage.removeItem('sb-activities-fetch-time');
    
    toast({
      title: "Historiska aktiviteter rensade",
      description: `${historicalActivities.length} historiska aktiviteter har rensats.`,
    });
    
    return success;
  } catch (error) {
    console.error("Error handling historical activity clearing:", error);
    toast({
      title: "Kunde inte rensa historiska aktiviteter",
      description: "Ett fel uppstod när de historiska aktiviteterna skulle rensas. Försök igen.",
      variant: "destructive"
    });
    return false;
  }
};
