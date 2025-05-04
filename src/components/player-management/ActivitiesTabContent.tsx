
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player, Activity } from "@/types/player";
import { useIsMobile } from "@/hooks/use-mobile";
import { ActivityTabContent } from "@/components/tabs/activity-tab";

interface ActivitiesTabContentProps {
  players: Player[];
  activities: Activity[];
  selectedActivity: Activity | null;
  selectedActivityTypes: string[];
  filteredActivities: Activity[];
  filteredHistoricalActivities?: Activity[];
  onActivitySelect: (activity: Activity | null) => void;
  onActivityTypeChange: (type: string) => void;
  onAddActivityClick: () => void;
  onEditActivityClick: (activity: Activity) => void;
  onActivityUpdate: (activity: Activity) => Promise<void>;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  handleMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
}

export function ActivitiesTabContent({
  players,
  activities,
  selectedActivity,
  selectedActivityTypes,
  filteredActivities,
  filteredHistoricalActivities,
  onActivitySelect,
  onActivityTypeChange,
  onAddActivityClick,
  onEditActivityClick,
  onActivityUpdate,
  handleKioskUpdate,
  handleDeleteActivity,
  handleMatchResultUpdate
}: ActivitiesTabContentProps) {
  const isMobile = useIsMobile();
  
  // Filter activities for cup matches
  const cupMatches = activities.filter(activity => activity.type === "cup");
  
  console.log("ActivitiesTabContent: Match result update handler:", !!handleMatchResultUpdate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktiviteter</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityTabContent 
          activities={activities}
          players={players}
          selectedActivity={selectedActivity}
          selectedActivityTypes={selectedActivityTypes}
          filteredActivities={filteredActivities}
          filteredHistoricalActivities={filteredHistoricalActivities}
          handleActivityTypeChange={onActivityTypeChange}
          setSelectedActivity={onActivitySelect}
          handleActivityUpdate={onActivityUpdate}
          onAddActivityClick={onAddActivityClick}
          onEditActivityClick={onEditActivityClick}
          setEditingActivity={onEditActivityClick}
          handleKioskAssignmentUpdate={handleKioskUpdate}
          handleDeleteActivity={handleDeleteActivity}
          handleMatchResultUpdate={handleMatchResultUpdate}
          cupMatches={cupMatches}
        />
      </CardContent>
    </Card>
  );
}
