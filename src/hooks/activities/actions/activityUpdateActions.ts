
import { Activity, Player } from "@/types/player";
import { toast } from "sonner";
import { handleActivityUpdate } from "./updateActivity";
import { handleKioskAssignmentUpdate } from "./updateKioskAssignment";
import { handleAddActivity } from "./addActivity";
import { handleMatchResultUpdate as importedHandleMatchResultUpdate } from "./match-result";

/**
 * Export all activity update actions from a single point
 */
export { 
  handleActivityUpdate,
  handleKioskAssignmentUpdate, 
  handleAddActivity,
  importedHandleMatchResultUpdate as handleMatchResultUpdate
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
