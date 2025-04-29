
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityList } from "@/components/activity-list/ActivityList";
import { PlayerDetail } from "@/components/player-detail/PlayerDetail";
import { ActivityDetail } from "@/components/activity-detail";
import { StatisticsTabsWrapper } from "@/components/player-management/statistics/StatisticsTabsWrapper";
import { LoadingState } from "@/components/LoadingState";

interface ActivityTabViewContentProps {
  activeView: string;
  renderContent: () => any;
  players: Player[];
  activities: Activity[];
  isLoading?: boolean;
  loadError?: string | null;
  retryLoading?: () => void;
  onActivitySelect: (activity: Activity | null) => void;
  onPlayerSelect: (playerId: string) => void;
  onEditActivity: (activity: Activity) => void;
  onActivityUpdate: (activity: Activity) => Promise<void>;
  onDeleteActivity: (activityId: string) => Promise<boolean>;
  onKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function ActivityTabViewContent({
  activeView,
  renderContent,
  players,
  activities,
  isLoading = false,
  loadError = null,
  retryLoading,
  onActivitySelect,
  onPlayerSelect,
  onEditActivity,
  onActivityUpdate,
  onDeleteActivity,
  onKioskAssignmentUpdate,
  onMatchResultUpdate
}: ActivityTabViewContentProps) {
  // Show loading state while data is loading
  if (isLoading) {
    return <LoadingState message="Laddar aktiviteter från databasen..." />;
  }
  
  // Show error state if there's an error
  if (loadError) {
    return <LoadingState error={loadError} retry={retryLoading} />;
  }
  
  // Render content based on the return value from renderContent
  const content = renderContent();
  
  if (!content) {
    return null;
  }
  
  switch (content.viewType) {
    case 'player-detail':
      return (
        <PlayerDetail 
          player={content.player}
          activities={activities}
          allPlayers={players}
          onClose={() => onPlayerSelect('')}
          onPlayerUpdate={() => {}} // Not implemented in this context
        />
      );
      
    case 'activity-detail':
      return (
        <ActivityDetail 
          activity={content.activity}
          players={players}
          relatedActivities={content.relatedActivities}
          cupMatches={content.cupMatches}
          allActivities={activities}
          onBack={() => onActivitySelect(null)}
          onEdit={onEditActivity}
          onActivityUpdate={onActivityUpdate}
          onDeleteActivity={onDeleteActivity}
          onKioskAssignmentUpdate={onKioskAssignmentUpdate}
          onClose={() => onActivitySelect(null)}
          onMatchResultUpdate={onMatchResultUpdate}
          onPlayerSelect={onPlayerSelect}
          onActivitySelect={onActivitySelect}
        />
      );
      
    case 'statistics':
      return (
        <StatisticsTabsWrapper 
          players={players}
          activities={activities}
          gradeData={players.reduce((acc, player) => {
            if (player.positions?.includes("TRÄNARE")) return acc;
            
            const grade = player.grade;
            const existingGrade = acc.find(item => item.grade === grade);
            
            if (existingGrade) {
              existingGrade.players++;
            } else {
              acc.push({ grade, players: 1 });
            }
            
            return acc;
          }, [] as { grade: string, players: number }[]).sort((a, b) => a.grade.localeCompare(b.grade))}
        />
      );
      
    case 'activities-list':
    default:
      return (
        <ActivityList 
          activities={content.activities}
          players={players}
          onSelect={onActivitySelect}
          onPlayerSelect={onPlayerSelect}
          isHistorical={activeView === 'historical'}
          noResultsMessage={content.searchQuery ? `Inga matcher hittades för "${content.searchQuery}"` : "Inga aktiviteter hittades"}
        />
      );
  }
}
