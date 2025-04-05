
import { format, parseISO } from "date-fns";

/**
 * Formats a date string into a user-friendly format
 * @param dateStr ISO date string
 * @returns Formatted date string
 */
export function formatActivityDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateStr;
  }
}

/**
 * Checks if an activity is in the past based on its date and time
 * @param date Activity date string
 * @param time Optional activity time string (HH:MM)
 * @returns boolean indicating if the activity is in the past
 */
export function isActivityInPast(date: string, time?: string): boolean {
  const now = new Date();
  const activityDate = new Date(date);
  
  // If there's a time specified, add it to the activity date
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    activityDate.setHours(hours || 0, minutes || 0);
  } else {
    // If no time specified, use end of day (23:59:59)
    activityDate.setHours(23, 59, 59);
  }
  
  return activityDate < now;
}
