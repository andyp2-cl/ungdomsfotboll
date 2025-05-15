
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
  onPlayerSelect?: (player: Player) => void;
  handleActivityUpdate?: (activity: Activity) => Promise<void>;
  handleKioskUpdate?: (activityId: string, playerId?: string) => Promise<boolean>;
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
  onPlayerSelect,
  handleActivityUpdate,
  handleKioskUpdate
}: ActivityTabContentProps) {
  const { 
    activeView,
    handleViewChange,
  } = useActivityTabViews({
    activities,
    players,
    selectedActivity,
    setSelectedActivity,
    filteredActivities,
    filteredHistoricalActivities,
    handleActivityTypeChange,
    handleDelete,
    onPlayerSelect
  });

  return (
    <div className="space-y-6">
      <ActivityList 
        activities={filteredActivities}
        onActivitySelect={setSelectedActivity}
        onDelete={handleDelete}
        onPlayerSelect={onPlayerSelect}
      />
    </div>
  );
}
