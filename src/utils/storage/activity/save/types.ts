
import { Activity } from "@/types/player";

/**
 * Types related to activity save operations
 */

export interface SaveActivityResult {
  success: boolean;
  isNew?: boolean;
  error?: any;
  message?: string;
}

export interface SaveApproachResult {
  saved: boolean;
  error?: any;
}

export interface ActivitySaveData {
  activity: Activity;
  formattedActivity: any;
  isNewActivity: boolean;
}
