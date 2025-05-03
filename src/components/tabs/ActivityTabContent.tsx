
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityFilter } from "@/components/ActivityFilter";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetailWrapper } from "@/components/activity-management/ActivityDetailWrapper";
import { Button } from "@/components/ui/button";
import { Activity as ActivityIcon, PlusCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityTabContentProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: string[];
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  isAddActivityOpen: boolean;
  isLoading?: boolean;
  loadError?: Error | null;
  retryLoading?: () => void;
  handleActivityTypeChange: (type: string) => void;
  setSelectedActivity: (activity: Activity | null) => void;
  handleActivityUpdate: (activity: Activity) => Promise<void>;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  setEditingActivity: (activity: Activity | null) => void;
  handleKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  handleImportedActivities: (activities: Activity[]) => Promise<boolean>;
  handleClearHistoricalActivities: () => Promise<boolean>;
  handleMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function ActivityTabContent({
  activities,
  players,
  selectedActivity,
  selectedActivityTypes,
  filteredActivities,
  filteredHistoricalActivities,
  isAddActivityOpen,
  isLoading,
  loadError,
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
}: ActivityTabContentProps) {
  const isMobile = useIsMobile();
  
  console.log("ActivityTabContent rendering with handleMatchResultUpdate:", !!handleMatchResultUpdate);
  
  // Select cup matches for the selected activity if applicable
  const cupMatches = selectedActivity?.cupId 
    ? activities.filter(a => a.cupId === selectedActivity.cupId && a.id !== selectedActivity.id)
    : [];

  return (
    <div className="space-y-6">
      {!selectedActivity ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold">Kommande aktiviteter</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <Button 
                onClick={() => setIsAddActivityOpen(true)}
                className="w-full sm:w-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Lägg till aktivitet
              </Button>
              {/* Removed activity filter as requested */}
            </div>
          </div>
          
          <ActivityList 
            activities={filteredActivities} 
            onSelect={setSelectedActivity}
            players={players} 
            isMobile={isMobile}
          />
        </>
      ) : (
        <ActivityDetailWrapper
          selectedActivity={selectedActivity}
          players={players}
          activities={activities}
          cupMatches={cupMatches}
          onActivitySelect={setSelectedActivity}
          onEditActivityClick={setEditingActivity}
          onActivityUpdate={handleActivityUpdate}
          handleKioskUpdate={handleKioskAssignmentUpdate}
          handleDeleteActivity={handleDeleteActivity}
          handleMatchResultUpdate={handleMatchResultUpdate}
        />
      )}
    </div>
  );
}
