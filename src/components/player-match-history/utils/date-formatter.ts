
// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('sv-SE');
};

// Sort activities by date, newest first
export const sortActivitiesByDate = (activities: any[]): any[] => {
  return [...activities].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};
