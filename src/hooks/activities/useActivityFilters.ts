
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

  // Filtrera aktiviteter (men använd inte selectedActivityTypes längre)
  const filteredCurrentActivities = useMemo(() => {
    return currentActivities
      .sort((a, b) => {
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        
        if (dateComparison === 0 && a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        
        return dateComparison;
      });
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
