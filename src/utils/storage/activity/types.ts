
import { Activity } from "@/types/player";

// Re-export common types needed for activity storage
export type { Activity };

// Define additional types specific to activity storage operations
export interface ActivityRelationship {
  id: string;
  player_id: string;
  activity_id: string;
}

export interface ActivityStorageOperationResult {
  success: boolean;
  message?: string;
}
