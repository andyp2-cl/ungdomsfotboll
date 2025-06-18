import { Activity, Player } from "@/types/player";
import { handleActivityUpdate as updateActivity } from "./updateActivity";
import { handleKioskAssignmentUpdate } from "./updateKioskAssignment";
import { handleAddActivity } from "./addActivity";
import { handleMatchResultUpdate } from "./updateMatchResult";

/**
 * Export all activity update actions from a single point
 */
export { 
  handleKioskAssignmentUpdate, 
  handleAddActivity,
  handleMatchResultUpdate
};

/**
 * Wrapper for handleActivityUpdate with proper error handling
 */
export const handleActivityUpdate = async (
  activity: Activity,
  onSuccess?: (activity: Activity) => void,
  onError?: (error: Error) => void,
  onWarning?: (title: string, description: string) => void
): Promise<void> => {
  try {
    await updateActivity(activity, onSuccess, onError, onWarning);
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
    throw error;
  }
};

/**
 * @deprecated Use the individual action files directly
 */
export const handleActivityUpdateOld = updateActivity;

/**
 * @deprecated Use the individual action files directly
 */
export const handleKioskAssignmentUpdateOld = handleKioskAssignmentUpdate;

/**
 * @deprecated Use the individual action files directly
 */
export const handleAddActivityOld = handleAddActivity;
