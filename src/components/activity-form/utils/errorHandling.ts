
import { toast } from "sonner";

/**
 * Standard error handler for activity operations
 * @param error The error that occurred
 * @param defaultMessage Default message to show if error has no message
 * @returns The error for further handling if needed
 */
export function handleActivityError(error: unknown, defaultMessage = "Ett fel uppstod"): Error {
  console.error("Activity operation failed:", error);
  
  // Convert to Error object if it isn't already
  const errorObj = error instanceof Error ? error : new Error(
    typeof error === 'object' && error !== null && 'message' in error 
      ? String((error as {message: string}).message)
      : defaultMessage
  );
  
  // Show error message to user
  toast.error(`${defaultMessage}: ${errorObj.message}`);
  
  return errorObj;
}
