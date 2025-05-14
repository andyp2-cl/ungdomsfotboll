import React from 'react';
import { Player, Activity } from '@/types/player';
import { useActivityTabViews } from '@/hooks/useActivityTabViews';
import { ActivityList } from '@/components/activity/ActivityList';

interface ActivityTabContentProps {
  activities: Activity[];
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  selectedActivity: Activity | null;
  selectedActivityTypes: string[];
  players: Player[];
  handleActivityTypeChange: (type: string) => void;
  setSelectedActivity: (activity: Activity | null) => void;
  handleDelete: (activityId: string) => Promise<boolean>;
  onPlayerSelect?: (player: Player) => void; // Make this optional to resolve type error
}

export function ActivityTabContent({
  activities,
  filteredActivities,
  filteredHistoricalActivities,
  selectedActivity,
  selectedActivityTypes,
  players,
  handleActivityTypeChange,
  setSelectedActivity,
  handleDelete,
  onPlayerSelect, // Include this prop
}: ActivityTabContentProps) {
  const { 
    handleActivityUpdate, 
    handleKioskUpdate 
  } = useActivityTabViews({
    activities,
    filteredActivities,
    filteredHistoricalActivities,
    selectedActivity,
    selectedActivityTypes,
    players,
    handleActivityTypeChange,
    setSelectedActivity,
    handleDelete,
    onPlayerSelect: onPlayerSelect, // Pass onPlayerSelect to the hook
  });

  return (
    <div className="space-y-6">
      <ActivityList 
        activities={filteredActivities}
        onActivitySelect={setSelectedActivity}
        onDelete={handleDelete}
        onPlayerSelect={onPlayerSelect} // Pass onPlayerSelect to ActivityList
      />
    </div>
  );
}
