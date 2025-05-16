
/**
 * Format a date string to a more readable format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Get the day name
    const dayName = date.toLocaleDateString('sv-SE', { weekday: 'short' });
    
    // Format the full date
    const formattedDate = date.toLocaleDateString('sv-SE');
    
    // Capitalize the first letter of the day name
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    return `${capitalizedDay} ${formattedDate}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}
