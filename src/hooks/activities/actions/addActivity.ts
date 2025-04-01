
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";

/**
 * Handles adding a new activity
 */
export const handleAddActivity = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  newActivity: Activity
) => {
  const updatedActivities = [...activities, newActivity];
  setActivities(updatedActivities);
  await saveActivities(updatedActivities);
  
  toast({
    title: "Aktivitet tillagd",
    description: `${newActivity.name} har lagts till.`,
  });
};
