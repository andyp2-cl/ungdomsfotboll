
/**
 * Format a date string to a localized format
 * @param dateString A date string in ISO format (YYYY-MM-DD)
 * @returns Formatted date string according to Swedish locale
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Get the day of the week from a date string
 * @param dateString A date string in ISO format (YYYY-MM-DD)
 * @returns Day of the week in Swedish, capitalized
 */
export const getDayOfWeek = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('sv-SE', { weekday: 'long' });
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
  } catch (error) {
    console.error('Error getting day of week:', error);
    return '';
  }
};
