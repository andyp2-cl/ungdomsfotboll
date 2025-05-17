
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
  onPlayerSelect?: (playerId: string) => void; // Changed to accept playerId
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
  handleClearHistoricalActivities,
  handleMatchResultUpdate,
  onPlayerSelect = () => {} // Provide default empty function
}: ActivitiesTabContentProps) {
  // Create a handler for player selection within activities
  const handlePlayerSelectWithinActivity = (playerId: string) => {
    console.log("ActivitiesTabContent: Player selected:", playerId);
    if (onPlayerSelect) {
      onPlayerSelect(playerId);
    }
  };

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
        onPlayerSelect={handlePlayerSelectWithinActivity}
      />
    </div>
  );
}
