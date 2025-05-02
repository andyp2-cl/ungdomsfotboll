
import { Activity } from "@/types/player";
import { PostgrestResponse } from "@supabase/supabase-js";

// Re-export common types needed for activity storage
export type { Activity, PostgrestResponse };

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
