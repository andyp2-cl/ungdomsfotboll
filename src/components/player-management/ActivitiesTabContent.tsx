
import React from "react";
import { Player, Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
  handleActivityUpdate: (activity: Activity) => void;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  setEditingActivity: (activity: Activity | null) => void;
  handleKioskAssignmentUpdate: (activityId: string, playerId: string) => void;
  handleDeleteActivity: (activityId: string) => void;
  handleImportedActivities: (activities: Activity[]) => void;
  handleClearHistoricalActivities: () => void;
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
      
      <div className="text-center text-gray-500 py-8">
        Aktivitetshantering är implementerad i ActivityManagement-komponenten.
        Detta är endast en placeholder för PlayerManagementPage.
      </div>
    </div>
  );
}
