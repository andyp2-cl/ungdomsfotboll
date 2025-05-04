
import { ActivityFormValues } from "../formSchema";
import { toast } from "sonner";

/**
 * Validates activity data before submission
 * @param values The activity form values to validate
 * @returns null if valid, error message if invalid
 */
export function validateActivity(values: ActivityFormValues): string | null {
  // Required fields validation
  if (!values.name || values.name.trim() === "") {
    return "Namn måste anges";
  }

  if (!values.date) {
    return "Datum måste anges";
  }

  // For match type, validate score values if provided
  if (values.type === "match") {
    if (values.homeScore !== undefined || values.awayScore !== undefined) {
      // If one score is defined, both must be defined
      if (values.homeScore === undefined || values.awayScore === undefined) {
        return "Båda poängen måste anges";
      }
      
      // Scores must be non-negative
      if (values.homeScore < 0 || values.awayScore < 0) {
        return "Poäng måste vara positiva tal";
      }
    }
  }

  return null;
}

/**
 * Display validation errors as toast messages
 */
export function showValidationError(error: string): void {
  toast.error(error);
}
