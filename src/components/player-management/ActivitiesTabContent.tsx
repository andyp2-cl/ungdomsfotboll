
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
  isAddActivityOpen: boolean;
  handleActivityTypeChange: (type: string) => void;
  setSelectedActivity: (activity: Activity | null) => void;
  setEditingActivity: (activity: Activity | null) => void;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  handleActivityUpdate: (activity: Activity) => Promise<void>;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDelete: (activityId: string) => Promise<boolean>;
  handleImportActivities: (activities: Activity[]) => Promise<boolean>;
  handleClearHistorical: () => Promise<boolean>;
  handleAddActivity: (activity: Activity) => Promise<void>;
  handleMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
  onPlayerSelect: (player: Player) => void; // Lägg till detta för att hantera val av spelare
}

export function ActivitiesTabContent({
  activities,
  players,
  selectedActivity,
  selectedActivityTypes,
  filteredActivities,
  filteredHistoricalActivities,
  isAddActivityOpen,
  handleActivityTypeChange,
  setSelectedActivity,
  setEditingActivity,
  setIsAddActivityOpen,
  handleActivityUpdate,
  handleKioskUpdate,
  handleDelete,
  handleImportActivities,
  handleClearHistorical,
  handleAddActivity,
  handleMatchResultUpdate,
  onPlayerSelect, // Inkludera denna prop
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
        isAddActivityOpen={isAddActivityOpen}
        handleActivityTypeChange={handleActivityTypeChange}
        setSelectedActivity={setSelectedActivity}
        setEditingActivity={setEditingActivity}
        setIsAddActivityOpen={setIsAddActivityOpen}
        handleActivityUpdate={handleActivityUpdate}
        handleKioskUpdate={handleKioskUpdate}
        handleDelete={handleDelete}
        handleImportActivities={handleImportActivities}
        handleClearHistorical={handleClearHistorical}
        handleAddActivity={handleAddActivity}
        handleMatchResultUpdate={handleMatchResultUpdate}
        onPlayerSelect={onPlayerSelect} // Skicka vidare onPlayerSelect
      />
    </div>
  );
}
