
import React from "react";
import { Activity, Player } from "@/types/player";
import { LoadingState } from "@/components/LoadingState";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetailWrapper } from "@/components/activity-management/ActivityDetailWrapper";
import { TeamStatistics } from "@/components/TeamStatistics";
import { PlayerDetail } from "@/components/PlayerDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ActivityTabContentProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: string[];
  filteredActivities: Activity[];
  filteredHistoricalActivities?: Activity[]; // Keep this as optional
  handleActivityTypeChange: (type: string) => void;
  setSelectedActivity: (activity: Activity | null) => void;
  handleActivityUpdate: (activity: Activity) => Promise<void>;
  onAddActivityClick: () => void;
  onEditActivityClick: (activity: Activity) => void;
  setEditingActivity: (activity: Activity) => void;
  handleKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  handleMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
  isLoading?: boolean;
  loadError?: string | null;
  retryLoading?: () => void;
  cupMatches?: Activity[];
}

export function ActivityTabContent({
  activities,
  players,
  selectedActivity,
  selectedActivityTypes,
  filteredActivities,
  filteredHistoricalActivities,
  handleActivityTypeChange,
  setSelectedActivity,
  handleActivityUpdate,
  onAddActivityClick,
  onEditActivityClick,
  setEditingActivity,
  handleKioskAssignmentUpdate,
  handleDeleteActivity,
  handleMatchResultUpdate,
  isLoading,
  loadError,
  retryLoading,
  cupMatches = []
}: ActivityTabContentProps) {
  // Intercept player selection to avoid prop drilling
  const [selectedPlayerId, setSelectedPlayerId] = React.useState<string | null>(null);
  
  if (isLoading) {
    return (
      <LoadingState 
        message="Laddar aktiviteter..." 
        error={loadError || null} 
        retry={retryLoading}
      />
    );
  }
  
  if (selectedActivity) {
    console.log("Rendering ActivityDetailWrapper with handleMatchResultUpdate:", !!handleMatchResultUpdate);
    
    return (
      <ActivityDetailWrapper
        selectedActivity={selectedActivity}
        players={players}
        activities={activities}
        cupMatches={cupMatches}
        onActivitySelect={setSelectedActivity}
        onEditActivityClick={onEditActivityClick}
        onActivityUpdate={handleActivityUpdate}
        handleKioskUpdate={handleKioskAssignmentUpdate}
        handleDeleteActivity={handleDeleteActivity}
        handleMatchResultUpdate={handleMatchResultUpdate}
      />
    );
  }
  
  const selectedPlayer = players.find(player => player.id === selectedPlayerId);
  
  if (selectedPlayer) {
    return (
      <PlayerDetail
        player={selectedPlayer}
        activities={activities}
        onClose={() => setSelectedPlayerId(null)}
        onEdit={() => {}}
        onPlayerUpdate={() => {}}
        allPlayers={players}
        onActivitySelect={setSelectedActivity}
      />
    );
  }

  if (filteredActivities.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">Inga aktiviteter hittades</p>
      </div>
    );
  }
  
  return (
    <ActivityList
      activities={filteredActivities}
      onSelect={setSelectedActivity}
      players={players}
      onPlayerSelect={(playerId) => setSelectedPlayerId(playerId)}
    />
  );
}
