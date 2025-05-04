
import React from "react";
import { Activity, Player } from "@/types/player";
import { LoadingState } from "@/components/LoadingState";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetailWrapper } from "@/components/activity-management/ActivityDetailWrapper";
import { TeamStatistics } from "@/components/TeamStatistics";
import { PlayerDetail } from "@/components/PlayerDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ActivityTabViewContentProps {
  activeView: "current" | "historical" | "statistics" | "tools";
  renderContent: () => any;
  players: Player[];
  activities: Activity[];
  isLoading?: boolean;
  loadError?: string | null;
  retryLoading?: () => void;
  onActivitySelect: (activity: Activity | null) => void;
  onPlayerSelect: (player: Player | null) => void;
  onEditActivity: (activity: Activity | null) => void;
  onActivityUpdate: (activity: Activity) => Promise<void>;
  onDeleteActivity: (activityId: string) => Promise<boolean>;
  onKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
}

export function ActivityTabViewContent({
  activeView,
  renderContent,
  players,
  activities,
  isLoading,
  loadError,
  retryLoading,
  onActivitySelect,
  onPlayerSelect,
  onEditActivity,
  onActivityUpdate,
  onDeleteActivity,
  onKioskAssignmentUpdate,
  onMatchResultUpdate
}: ActivityTabViewContentProps) {
  const content = renderContent();
  const selectedPlayerId = content.selectedPlayerId;
  const selectedPlayer = selectedPlayerId ? players.find(player => player.id === selectedPlayerId) : null;
  
  if (isLoading) {
    return (
      <LoadingState 
        message="Laddar aktiviteter..." 
        error={loadError || null} 
        retry={retryLoading}
      />
    );
  }
  
  if (activeView === "tools") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Importera aktiviteter</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="live">
            <TabsList>
              <TabsTrigger value="live">Från live-miljö</TabsTrigger>
              <TabsTrigger value="file">Från fil</TabsTrigger>
            </TabsList>
            
            <TabsContent value="live" className="pt-4">
              <p>Import-funktion kommer snart</p>
            </TabsContent>
            
            <TabsContent value="file">
              <p>Filimport kommer snart</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }
  
  if (activeView === "statistics") {
    return (
      <TeamStatistics 
        players={players}
        activities={activities}
        onPlayerSelect={player => onPlayerSelect(player)}
      />
    );
  }
  
  if (content.selectedActivity) {
    console.log("Rendering ActivityDetailWrapper with handleMatchResultUpdate:", !!onMatchResultUpdate);
    
    return (
      <ActivityDetailWrapper
        selectedActivity={content.selectedActivity}
        players={players}
        activities={activities}
        cupMatches={content.selectedActivity.type === 'cup' 
          ? activities.filter(a => a.cupId === content.selectedActivity.id)
          : []}
        onActivitySelect={onActivitySelect}
        onEditActivityClick={onEditActivity}
        onActivityUpdate={onActivityUpdate}
        handleKioskUpdate={onKioskAssignmentUpdate}
        handleDeleteActivity={onDeleteActivity}
        handleMatchResultUpdate={onMatchResultUpdate}
      />
    );
  }
  
  if (selectedPlayer) {
    return (
      <PlayerDetail
        player={selectedPlayer}
        activities={activities}
        onClose={() => onPlayerSelect(null)}
        onEdit={() => {}}
        onPlayerUpdate={() => {}}
        allPlayers={players}
        onActivitySelect={onActivitySelect}
      />
    );
  }

  if (content.activities.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">Inga aktiviteter hittades</p>
      </div>
    );
  }
  
  return (
    <ActivityList
      activities={content.activities}
      onSelect={onActivitySelect}
      players={players}
    />
  );
}
