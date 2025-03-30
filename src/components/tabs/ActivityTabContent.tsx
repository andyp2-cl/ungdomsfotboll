
import { ActivityManagement } from "@/components/ActivityManagement";
import { Activity, Player } from "@/types/player";

interface ActivityTabContentProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: string[];
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  isAddActivityOpen: boolean;
  handleActivityTypeChange: (type: any) => void;
  setSelectedActivity: (activity: Activity | null) => void;
  handleActivityUpdate: (activity: Activity) => void;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  setEditingActivity: (activity: Activity | null) => void;
  handleKioskAssignmentUpdate: (activityId: string, playerId?: string) => void;
  handleDeleteActivity: (activityId: string) => void;
  handleImportedActivities: (activities: Activity[]) => void;
  handleScrapedMatches: (activities: Activity[], clearExisting?: boolean) => void;
  handleClearHistoricalActivities: () => void;
}

export function ActivityTabContent({
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
  handleScrapedMatches,
  handleClearHistoricalActivities
}: ActivityTabContentProps) {
  return (
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
      onKioskAssignmentUpdate={handleKioskAssignmentUpdate}
      onDeleteActivity={handleDeleteActivity}
      onImportedActivities={handleImportedActivities}
      onMatchesScraped={handleScrapedMatches}
      onClearHistoricalActivities={handleClearHistoricalActivities}
    />
  );
}
