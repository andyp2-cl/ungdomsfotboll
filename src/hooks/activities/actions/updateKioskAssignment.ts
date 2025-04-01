
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";

/**
 * Handles assigning a player to kiosk duty for an activity
 */
export const handleKioskAssignmentUpdate = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  activityId: string, 
  playerId?: string
) => {
  const updatedActivities = activities.map(activity => 
    activity.id === activityId 
      ? { ...activity, kioskAssignedPlayerId: playerId }
      : activity
  );
  
  setActivities(updatedActivities);
  await saveActivities(updatedActivities);
  
  toast({
    title: "Kioskansvarig uppdaterad",
    description: playerId 
      ? `Ny spelare har tilldelats kioskansvar för denna aktivitet.`
      : `Kioskansvarig har tagits bort från denna aktivitet.`,
  });
};
