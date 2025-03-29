
import { useState, useMemo } from "react";
import { Activity, ActivityType } from "@/types/player";

export function useActivityFilters(activities: Activity[]) {
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<ActivityType[]>([]);

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

  const handleActivityTypeChange = (type: ActivityType) => {
    setSelectedActivityTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const filteredCurrentActivities = useMemo(() => {
    return currentActivities
      .filter(activity => {
        return selectedActivityTypes.length === 0 || selectedActivityTypes.includes(activity.type);
      })
      .sort((a, b) => {
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        
        if (dateComparison === 0 && a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        
        return dateComparison;
      });
  }, [selectedActivityTypes, currentActivities]);

  const filteredHistoricalActivities = useMemo(() => {
    return historicalActivities
      .filter(activity => {
        return selectedActivityTypes.length === 0 || selectedActivityTypes.includes(activity.type);
      })
      .sort((a, b) => {
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        
        if (dateComparison === 0 && a.time && b.time) {
          return b.time.localeCompare(a.time);
        }
        
        return dateComparison;
      });
  }, [selectedActivityTypes, historicalActivities]);

  return {
    selectedActivityTypes,
    filteredCurrentActivities,
    filteredHistoricalActivities,
    currentActivities,
    historicalActivities,
    handleActivityTypeChange
  };
}
