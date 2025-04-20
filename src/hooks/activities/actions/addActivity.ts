
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";

/**
 * Handle adding a new activity
 */
export const handleAddActivity = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  newActivity: Activity
): Promise<void> => {
  try {
    console.log("handleAddActivity called with activity:", {
      id: newActivity.id,
      name: newActivity.name,
      type: newActivity.type,
      date: newActivity.date,
      cupId: newActivity.cupId
    });
    
    // Make a clean copy of the new activity to avoid reference issues
    const activityToSave = structuredClone(newActivity);
    
    // Special handling for cup type activities
    if (activityToSave.type === "cup") {
      console.log(`Ensuring cup ID is set correctly for new cup ${activityToSave.name}`);
      // For a new cup, make sure cupId is set to its own ID
      activityToSave.cupId = activityToSave.id;
      activityToSave.cupName = activityToSave.name;
    }

    // Save to database FIRST, before updating the local state
    try {
      console.log("Saving new activity to database:", activityToSave.id);
      
      // Create a clean copy for saving to avoid any issues
      const cleanActivityToSave = JSON.parse(JSON.stringify(activityToSave));
      await saveActivities([cleanActivityToSave]);
      
      console.log(`Successfully saved activity ${activityToSave.name} (${activityToSave.id}) to database`);
      
      // Only update local state AFTER successful database save
      const updatedActivities = [...activities, activityToSave];
      setActivities(updatedActivities);
      
      console.log(`Added new ${activityToSave.type}: ${activityToSave.name}`);
      
      toast({
        title: "Aktivitet skapad",
        description: `${activityToSave.type === "cup" ? "Cup" : "Match"} skapad: ${activityToSave.name}`
      });
    } catch (saveError) {
      console.error("Error saving activity to database:", saveError);
      toast({
        title: "Error",
        description: "Kunde inte spara aktiviteten till databasen.",
        variant: "destructive"
      });
      throw saveError;
    }
  } catch (error) {
    console.error("Error in handleAddActivity:", error);
    toast({
      title: "Error",
      description: `Ett fel uppstod: ${error.message || "Kunde inte skapa aktivitet"}`,
      variant: "destructive"
    });
    throw error;
  }
};
