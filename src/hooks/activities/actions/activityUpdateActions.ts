import { Activity, Player } from "@/types/player";
import { toast } from "sonner";
import { handleActivityUpdate } from "./updateActivity";
import { handleKioskAssignmentUpdate } from "./updateKioskAssignment";
import { handleAddActivity } from "./addActivity";
import { handleMatchResultUpdate } from "./updateMatchResult";

/**
 * Export all activity update actions from a single point
 */
export { 
  handleActivityUpdate,
  handleKioskAssignmentUpdate, 
  handleAddActivity,
  handleMatchResultUpdate
};

/**
 * @deprecated Use the individual action files directly
 */
export const handleActivityUpdateOld = handleActivityUpdate;

/**
 * @deprecated Use the individual action files directly
 */
export const handleKioskAssignmentUpdateOld = handleKioskAssignmentUpdate;

/**
 * @deprecated Use the individual action files directly
 */
export const handleAddActivityOld = handleAddActivity;

/**
 * Updates match results for an activity
 * @returns Promise<boolean> indicating success or failure
 */
export const handleMatchResultUpdate = async (
  activities: Activity[], 
  setActivities: (activities: Activity[]) => void,
  toast: any,
  activityId: string,
  homeScore?: number,
  awayScore?: number
): Promise<boolean> => {
  console.log(`handleMatchResultUpdate called for ${activityId} with scores ${homeScore}-${awayScore}`);
  return await handleMatchResultUpdate(activities, setActivities, toast, activityId, homeScore, awayScore);
};
