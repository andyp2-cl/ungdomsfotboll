
import React from "react";
import { Player, Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ActivityManagement } from "@/components/ActivityManagement";
import { ActivityTabContent as NewActivityTabContent } from "@/components/tabs/activity-tab";

interface ActivitiesTabContentProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: string[];
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  isAddActivityOpen: boolean;
  isLoading?: boolean;
  retryLoading?: () => void;
  handleActivityTypeChange: (type: string) => void;
  setSelectedActivity: (activity: Activity | null) => void;
  handleActivityUpdate: (activity: Activity) => Promise<void>; // Updated return type
  setIsAddActivityOpen: (isOpen: boolean) => void;
  setEditingActivity: (activity: Activity | null) => void;
  handleKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  handleImportedActivities: (activities: Activity[]) => Promise<boolean>;
  handleClearHistoricalActivities: () => Promise<boolean>;
  handleMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function ActivitiesTabContent({
  activities,
  players,
  selectedActivity,
  selectedActivityTypes,
  filteredActivities,
  filteredHistoricalActivities,
  isAddActivityOpen,
  isLoading,
  retryLoading,
  handleActivityTypeChange,
  setSelectedActivity,
  handleActivityUpdate,
  setIsAddActivityOpen,
  setEditingActivity,
  handleKioskAssignmentUpdate,
  handleDeleteActivity,
  handleImportedActivities,
  handleClearHistoricalActivities,
  handleMatchResultUpdate
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
      
      {/* Use the new refactored ActivityTabContent component */}
      <NewActivityTabContent
        activities={activities}
        players={players}
        selectedActivity={selectedActivity}
        selectedActivityTypes={selectedActivityTypes}
        filteredActivities={filteredActivities}
        filteredHistoricalActivities={filteredHistoricalActivities}
        isAddActivityOpen={isAddActivityOpen}
        isLoading={isLoading} 
        loadError={null} 
        retryLoading={retryLoading}
        handleActivityTypeChange={handleActivityTypeChange}
        setSelectedActivity={setSelectedActivity}
        handleActivityUpdate={handleActivityUpdate}
        setIsAddActivityOpen={setIsAddActivityOpen}
        setEditingActivity={setEditingActivity}
        handleKioskAssignmentUpdate={handleKioskAssignmentUpdate}
        handleDeleteActivity={handleDeleteActivity}
        handleImportedActivities={handleImportedActivities}
        handleClearHistoricalActivities={handleClearHistoricalActivities}
        handleMatchResultUpdate={handleMatchResultUpdate}
      />
    </div>
  );
}
