
import React from 'react';
import { Player, Activity } from '@/types/player';
import { ActivityTabContent } from '@/components/tabs/activity-tab/ActivityTabContent'; 

interface ActivitiesTabContentProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: string[];
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  handleActivityTypeChange: (type: string) => void;
  setSelectedActivity: (activity: Activity | null) => void;
  setEditingActivity: (activity: Activity | null) => void;
  handleActivityUpdate: (activity: Activity) => Promise<void>;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDelete: (activityId: string) => Promise<boolean>;
  onPlayerSelect: (player: Player) => void;
}

export function ActivitiesTabContent({
  activities,
  players,
  selectedActivity,
  selectedActivityTypes,
  filteredActivities,
  filteredHistoricalActivities,
  handleActivityTypeChange,
  setSelectedActivity,
  setEditingActivity,
  handleActivityUpdate,
  handleKioskUpdate,
  handleDelete,
  onPlayerSelect,
}: ActivitiesTabContentProps) {
  return (
    <div className="space-y-6">
      <ActivityTabContent
        activities={activities}
        players={players}
        selectedActivity={selectedActivity}
        selectedActivityTypes={selectedActivityTypes}
        filteredActivities={filteredActivities}
        filteredHistoricalActivities={filteredHistoricalActivities}
        handleActivityTypeChange={handleActivityTypeChange}
        setSelectedActivity={setSelectedActivity}
        handleDelete={handleDelete}
        onPlayerSelect={onPlayerSelect}
        handleActivityUpdate={handleActivityUpdate}
        handleKioskUpdate={handleKioskUpdate}
      />
    </div>
  );
}
