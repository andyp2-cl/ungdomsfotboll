
import { useState, useMemo } from "react";
import { Activity } from "@/types/player";

export function useActivityFilters(activities: Activity[]) {
  // Vi behåller selectedActivityTypes men använder det inte längre i UI
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([]);

  const { currentActivities, historicalActivities } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const current: Activity[] = [];
    const historical: Activity[] = [];
    
    activities.forEach(activity => {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      
      if (activityDate >= today) {
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

  // Sortera kommande aktiviteter per månad (återgår till ursprunglig sortering)
  const filteredCurrentActivities = useMemo(() => {
    // Group activities by month
    const activitiesByMonth = currentActivities.reduce((acc, activity) => {
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
