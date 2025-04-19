
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { toast } from "sonner";

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

    // Save to database
    try {
      console.log("Saving new activity to database:", activityToSave.id);
      await saveActivities([activityToSave]);
      console.log(`Successfully saved activity ${activityToSave.name} (${activityToSave.id}) to database`);
    } catch (saveError) {
      console.error("Error saving activity to database:", saveError);
      toast.error("Kunde inte spara aktiviteten till databasen.");
      throw saveError;
    }

    // Update local state
    setActivities((prevActivities) => [...prevActivities, activityToSave]);

    console.log(`Added new ${activityToSave.type}: ${activityToSave.name}`);
    toast.success(`${activityToSave.type === "cup" ? "Cup" : "Match"} skapad: ${activityToSave.name}`);
  } catch (error) {
    console.error("Error in handleAddActivity:", error);
    toast.error(`Ett fel uppstod: ${error.message || "Kunde inte skapa aktivitet"}`);
    throw error;
  }
};
