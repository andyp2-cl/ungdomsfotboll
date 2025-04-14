
import React from "react";
import { Player, Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ActivityManagement } from "@/components/ActivityManagement";

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
  handleActivityUpdate: (activity: Activity) => Promise<void>; // Updated return type
  setIsAddActivityOpen: (isOpen: boolean) => void;
  setEditingActivity: (activity: Activity | null) => void;
  handleKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  handleImportedActivities: (activities: Activity[]) => Promise<boolean>;
  handleClearHistoricalActivities: () => Promise<boolean>;
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
  handleActivityUpdate,
  setIsAddActivityOpen,
  setEditingActivity,
  handleKioskAssignmentUpdate,
  handleDeleteActivity,
  handleImportedActivities,
  handleClearHistoricalActivities
}: ActivitiesTabContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Aktiviteter</h2>
        <Button onClick={() => setIsAddActivityOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Lägg till aktivitet
        </Button>
      </div>
      
      <ActivityManagement
        activities={activities}
        players={players}
        selectedActivity={selectedActivity}
        selectedActivityTypes={selectedActivityTypes}
        filteredActivities={filteredActivities}
        filteredHistoricalActivities={filteredHistoricalActivities}
        onActivityTypeChange={handleActivityTypeChange}
        onActivitySelect={setSelectedActivity}
        onActivityUpdate={handleActivityUpdate}
        onAddActivityClick={() => setIsAddActivityOpen(true)}
        onEditActivityClick={setEditingActivity}
        onKioskAssignmentUpdate={async (activityId, playerId) => {
          try {
            await handleKioskAssignmentUpdate(activityId, playerId);
            return true;
          } catch (error) {
            return false;
          }
        }}
        onDeleteActivity={handleDeleteActivity}
        onImportedActivities={handleImportedActivities}
        onClearHistoricalActivities={handleClearHistoricalActivities}
      />
    </div>
  );
}
