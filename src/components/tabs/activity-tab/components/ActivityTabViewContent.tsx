
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetail } from "@/components/activity-detail";
import { PlayerDetail } from "@/components/PlayerDetail";
import { StatisticsTabsWrapper } from "@/components/player-management/statistics/StatisticsTabsWrapper";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityTabViewContentProps {
  activeView: "upcoming" | "historical" | "statistics";
  renderContent: () => any;
  players?: Player[];
  activities?: Activity[];
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  onEditActivity?: (activity: Activity) => void;
  onActivityUpdate?: (activity: Activity) => void;
  onDeleteActivity?: (activityId: string) => Promise<boolean>;
  onKioskAssignmentUpdate?: (activityId: string, playerId?: string) => Promise<boolean>;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function ActivityTabViewContent({
  activeView,
  renderContent,
  players = [],
  activities = [],
  onActivitySelect,
  onPlayerSelect,
  onEditActivity,
  onActivityUpdate,
  onDeleteActivity,
  onKioskAssignmentUpdate,
  onMatchResultUpdate
}: ActivityTabViewContentProps) {
  const isMobile = useIsMobile();
  const content = renderContent();
  
  if (!content) {
    return activeView === "statistics" ? (
      <StatisticsTabsWrapper
        players={players}
        activities={activities}
        gradeData={players.reduce((acc, player) => {
          if (player.positions?.includes("TRÄNARE")) return acc;
          
          const grade = player.grade;
          const existingGrade = acc.find(item => item.grade === grade);
          
          if (existingGrade) {
            existingGrade.players++;
          } else if (grade) {
            acc.push({ grade, players: 1 });
          }
          
          return acc;
        }, [] as { grade: string, players: number }[]).sort((a, b) => a.grade.localeCompare(b.grade))}
      />
    ) : null;
  }

  switch (content.viewType) {
    case "player-detail":
      return (
        <PlayerDetail 
          player={content.player} 
          activities={content.activities} 
          onClose={() => onPlayerSelect && onPlayerSelect("")}
          onEdit={(player) => console.log("Edit player not implemented in this context", player)}
          onPlayerUpdate={(player) => console.log("Player update not implemented in this context", player)}
          allPlayers={players}
        />
      );
      
    case "activity-detail":
      return (
        <ActivityDetail 
          activity={content.activity}
          players={players}
          onBack={() => onActivitySelect && onActivitySelect(null)}
          onEdit={onEditActivity}
          onActivityUpdate={onActivityUpdate}
          onKioskAssignmentUpdate={onKioskAssignmentUpdate}
          onDeleteActivity={onDeleteActivity}
          onActivitySelect={onActivitySelect}
          relatedActivities={content.relatedActivities}
          cupMatches={content.cupMatches}
          allActivities={activities}
          onClose={() => onActivitySelect && onActivitySelect(null)}
          onMatchResultUpdate={onMatchResultUpdate}
          onPlayerSelect={onPlayerSelect}
        />
      );
      
    case "activities-list":
      return (
        <ActivityList 
          activities={content.activities}
          players={players}
          onSelect={onActivitySelect}
          onPlayerSelect={onPlayerSelect}
          isHistorical={activeView === "historical"}
          isMobile={isMobile}
          noResultsMessage={"Inga aktiviteter hittades"}
        />
      );
      
    default:
      return null;
  }
}
