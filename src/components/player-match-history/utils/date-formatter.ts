
/**
 * Format a date string to a more readable format
 * @param dateStr The date string to format (expected format YYYY-MM-DD)
 * @returns Formatted date string (e.g. "15 maj" or "15 maj 2025")
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    // Swedish month names
    const monthNames = [
      'januari', 'februari', 'mars', 'april', 'maj', 'juni',
      'juli', 'augusti', 'september', 'oktober', 'november', 'december'
    ];
    
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const currentYear = new Date().getFullYear();
    const dateYear = date.getFullYear();
    
    // Only include year if it's different from the current year
    if (dateYear !== currentYear) {
      return `${day} ${month} ${dateYear}`;
    }
    
    return `${day} ${month}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
};
