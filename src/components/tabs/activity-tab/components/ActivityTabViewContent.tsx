
import { Activity, Player } from "@/types/player";
import { ActivityList } from "@/components/activity-list";
import { ActivityDetail } from "@/components/activity-detail";
import { PlayerDetail } from "@/components/PlayerDetail";
import { StatisticsTabsWrapper } from "@/components/player-management/statistics/StatisticsTabsWrapper";

interface ActivityTabViewContentProps {
  activeView: "upcoming" | "historical" | "statistics";
  renderContent: any;
  players: Player[];
  activities: Activity[];
  onActivitySelect: (activity: Activity) => void;
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
  onActivitySelect,
  onPlayerSelect,
  onEditActivity,
  onActivityUpdate,
  onDeleteActivity,
  onKioskAssignmentUpdate,
  onMatchResultUpdate
}: ActivityTabViewContentProps) {
  const content = renderContent();

  if (activeView === "statistics") {
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
          } else if (grade) {
            acc.push({ grade, players: 1 });
          }
          
          return acc;
        }, [] as { grade: string, players: number }[]).sort((a, b) => a.grade.localeCompare(b.grade))}
      />
    );
  }

  if (content?.viewType === "player-detail" && content.player) {
    return (
      <PlayerDetail 
        player={content.player} 
        activities={content.activities} 
        onClose={() => onPlayerSelect("")}
        onEdit={() => console.log("Edit player not implemented")}
        onPlayerUpdate={() => console.log("Player update not implemented")}
        allPlayers={players}
        onActivitySelect={onActivitySelect}
      />
    );
  }

  if (content?.viewType === "activity-detail" && content.activity) {
    return (
      <ActivityDetail 
        activity={content.activity}
        players={players}
        onBack={() => onActivitySelect(null)}
        onEdit={onEditActivity}
        onDeleteActivity={onDeleteActivity}
        onActivityUpdate={onActivityUpdate}
        onKioskAssignmentUpdate={onKioskAssignmentUpdate}
        onActivitySelect={onActivitySelect}
        relatedActivities={content.relatedActivities}
        cupMatches={content.cupMatches}
        allActivities={activities}
        onClose={() => onActivitySelect(null)}
        onMatchResultUpdate={onMatchResultUpdate}
        onPlayerSelect={onPlayerSelect}
      />
    );
  }

  return (
    <ActivityList 
      activities={content?.activities || []}
      players={players}
      onSelect={onActivitySelect}
      onPlayerSelect={onPlayerSelect}
      isHistorical={activeView === "historical"}
      noResultsMessage={content?.searchQuery ? `Inga matcher hittades för "${content.searchQuery}"` : "Inga aktiviteter hittades"}
    />
  );
}
