
import { Activity, Player } from "@/types/player";
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
