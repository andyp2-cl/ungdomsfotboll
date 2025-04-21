
/**
 * Format the participants count to display in a human-readable format
 */
export const formatParticipantsCount = (count: number): string => {
  if (count === 0) {
    return "Inga deltagare";
  } else if (count === 1) {
    return "1 deltagare";
  } else {
    return `${count} deltagare`;
  }
};

/**
 * Get historical status of an activity
 * @param date The activity date
 */
export const isHistoricalActivity = (date: string): boolean => {
  const activityDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return activityDate < today;
};

/**
 * Format a date string to a localized date
 */
export const formatActivityDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

/**
 * Get a display string for location
 */
export const getLocationDisplay = (activity: any): string => {
  return activity.location?.name || 'Plats ej angiven';
};
