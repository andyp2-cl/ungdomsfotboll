
import { Activity } from "@/types/player";
import { ActivityFormValues } from "../formSchema";
import { validateActivity, showValidationError } from "./activityValidation";
import { toast } from "sonner";
import { handleActivityError } from "./errorHandling";
import { handleActivitySubmit } from "@/utils/activity/handleActivitySubmit";

interface SubmissionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * Handles the submission of an activity form
 * @param values Form values to submit
 * @param players Players to associate with the activity
 * @param onSave Function to call with the updated activity
 * @param options Additional options for handling success/error/completion
 * @returns Whether the submission was successful
 */
export async function submitActivityForm(
  values: ActivityFormValues,
  players: any[] = [],
  onSave: (activity: Activity) => void,
  options?: SubmissionOptions
): Promise<boolean> {
  // Validate form
  const validationError = validateActivity(values);
  if (validationError) {
    showValidationError(validationError);
    options?.onComplete?.();
    return false;
  }

  try {
    console.log("Submitting activity form with values:", values);
    
    // Create activity object from form values
    const activity: Activity = {
      ...(values as unknown as Activity),
      id: (values as any).id || undefined,
      player_stats: (values as any).player_stats || { goals: {}, assists: {} }
    };
    
    // Use the standard activity submission handler
    await handleActivitySubmit(activity, players, onSave, options?.onComplete || (() => {}));
    
    toast.success("Aktivitet sparad");
    options?.onSuccess?.();
    return true;
  } catch (error) {
    handleActivityError(error, "Kunde inte spara aktivitet");
    options?.onError?.(error instanceof Error ? error : new Error(String(error)));
    options?.onComplete?.();
    return false;
  }
}
