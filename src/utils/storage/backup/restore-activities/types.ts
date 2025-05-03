
import { Activity } from "@/types/player";

export interface RestoreResult {
  success: boolean;
  count: number;
  error?: any;
}

export interface ProcessedActivities {
  matchActivities: Activity[];
  remainingActivities: Activity[];
}
