import { useState, useMemo } from "react";
import { Activity } from "@/types/player";

export function useActivityFilters(activities: Activity[]) {
  // Vi behåller selectedActivityTypes men använder det inte längre i UI
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([]);

  const { currentActivities, historicalActivities } = useMemo(() => {
    const now = new Date();
    
    const current: Activity[] = [];
    const historical: Activity[] = [];
    
    // Ensure activities is an array before using forEach
    if (!Array.isArray(activities)) {
      console.warn('Activities is not an array:', activities);
      return { currentActivities: [], historicalActivities: [] };
    }
    
    activities.forEach(activity => {
      if (!activity || !activity.date) {
        console.warn('Invalid activity found:', activity);
        return;
      }

      const activityDate = new Date(activity.date);
      
      // If there's a time specified, add it to the activity date
      if (activity.time) {
        const [hours, minutes] = activity.time.split(':').map(Number);
        activityDate.setHours(hours || 0, minutes || 0);
      } else {
        // If no time specified, use end of day (23:59:59)
        activityDate.setHours(23, 59, 59);
      }
      
      // Compare with current time to determine if it's historical
      if (activityDate >= now) {
        current.push(activity);
      } else {
        historical.push(activity);
      }
    });
    
    return { currentActivities: current, historicalActivities: historical };
  }, [activities]);

  // Behåll funktionen för att ändra aktivitetstyper (för bakåtkompatibilitet)
  const handleActivityTypeChange = (type: string) => {
    setSelectedActivityTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // Sort the filtered activities
  const filteredCurrentActivities = useMemo(() => {
    if (!Array.isArray(currentActivities) || currentActivities.length === 0) {
      return [];
    }

    // Group activities by month
    const activitiesByMonth = currentActivities.reduce((acc, activity) => {
      if (!activity || !activity.date) {
        console.warn('Invalid activity in currentActivities:', activity);
        return acc;
      }

      const date = new Date(activity.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      
      acc[monthKey].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);
    
    // Sort activities within each month
    Object.keys(activitiesByMonth).forEach(month => {
      activitiesByMonth[month].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        const dateComparison = dateA.getTime() - dateB.getTime();
        
        if (dateComparison === 0 && a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        
        return dateComparison;
      });
    });
    
    // Flatten the sorted groups
    const sortedMonthKeys = Object.keys(activitiesByMonth).sort();
    return sortedMonthKeys.flatMap(month => activitiesByMonth[month]);
  }, [currentActivities]);

  const filteredHistoricalActivities = useMemo(() => {
    if (!Array.isArray(historicalActivities) || historicalActivities.length === 0) {
      return [];
    }

    return historicalActivities
      .sort((a, b) => {
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        
        if (dateComparison === 0 && a.time && b.time) {
          return b.time.localeCompare(a.time);
        }
        
        return dateComparison;
      });
  }, [historicalActivities]);

  return {
    selectedActivityTypes,
    filteredCurrentActivities,
    filteredHistoricalActivities,
    currentActivities,
    historicalActivities,
    handleActivityTypeChange
  };
}
