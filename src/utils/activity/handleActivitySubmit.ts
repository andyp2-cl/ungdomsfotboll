
import { Activity, Player } from "@/types/player";
import { generateUniqueId } from "@/utils/unique-id";
import { saveActivities } from "@/utils/storage";
import { supabase } from "@/lib/supabase/client";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity";
import { determineOutcome } from "@/components/activity-detail/match-result/utils";

/**
 * Handles the submission of a new or edited activity.
 * @param activity The activity to be submitted.
 * @param players The list of players to be associated with the activity.
 * @param setActivities A function to update the list of activities.
 * @param setIsOpen A function to close the activity submission form.
 */
export const handleActivitySubmit = async (
  activity: Activity,
  players: Player[],
  setActivities: (activities: Activity) => void,
  setIsOpen: (isOpen: boolean) => void
): Promise<void> => {
  try {
    // Generate a unique ID for the activity if it doesn't already have one
    const activityId = activity.id || generateUniqueId();

    // Extract player IDs from the selected players
    const playerIds = players.map((player) => player.id);

    // Create a new activity object with the submitted data
    const newActivity: Activity = {
      ...activity,
      id: activityId,
      playerIds: playerIds,
      // Use activity.type directly since "training" is now included in ActivityType
      type: activity.type || "match", 
      name: activity.name || "Namnlös aktivitet", // Default name if no name is provided
      // Use existing timestamps or create new ones
      created_at: activity.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(), // Always update the updated_at timestamp
    };

    // If it's a match, determine the outcome
    if (newActivity.type === "match") {
      newActivity.isWin = determineOutcome(newActivity);
    }

    // Format the activity for the database
    const formattedActivity = formatActivityForDatabase(newActivity);

    // Save the activity to the database
    const { error } = await supabase.from("activities").upsert([formattedActivity]);

    if (error) {
      console.error("Error saving activity:", error);
      throw new Error("Failed to save activity to database.");
    }

    // Update with the new activity
    setActivities(newActivity);

    // Close the activity submission form
    setIsOpen(false);
  } catch (error: any) {
    console.error("Error submitting activity:", error.message);
    // Re-throw the error to be caught by the calling function
    throw error;
  }
};
