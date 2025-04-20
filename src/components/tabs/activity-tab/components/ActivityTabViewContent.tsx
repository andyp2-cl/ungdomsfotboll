
import { Activity, Player } from "@/types/player";
import { StatisticsTabsWrapper } from "@/components/player-management/statistics/StatisticsTabsWrapper";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetail } from "@/components/activity-detail";
import { PlayerDetail } from "@/components/PlayerDetail";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityTabViewContentProps {
  activeView: "upcoming" | "historical" | "statistics";
  renderContent: () => any;
  players: Player[];
  activities: Activity[];
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
  onActivitySelect,
  onPlayerSelect,
  onEditActivity,
  onActivityUpdate,
  onDeleteActivity,
  onKioskAssignmentUpdate,
  onMatchResultUpdate
}: ActivityTabViewContentProps) {
  const isMobile = useIsMobile();
  
  // Get content from renderContent
  const content = renderContent();
  
  // If activeView is statistics, render the statistics wrapper
  if (activeView === "statistics") {
    const gradeData = players.reduce((acc, player) => {
      if (player.positions?.includes("TRÄNARE")) return acc;
      
      const grade = player.grade;
      const existingGrade = acc.find(item => item.grade === grade);
      
      if (existingGrade) {
        existingGrade.players++;
      } else {
        acc.push({ grade, players: 1 });
      }
      
      return acc;
    }, [] as { grade: string, players: number }[]);
    
    gradeData.sort((a, b) => a.grade.localeCompare(b.grade));
    
    return (
      <StatisticsTabsWrapper 
        players={players}
        activities={activities}
        gradeData={gradeData}
      />
    );
  }
  
  // Handle view rendering based on content type
  if (content) {
    if (content.viewType === "player-detail" && content.player) {
      return (
        <PlayerDetail 
          player={content.player} 
          activities={content.activities || activities} 
          onClose={() => onPlayerSelect("")}
          onEdit={(player) => console.log("Edit player not implemented in this context", player)}
          onPlayerUpdate={(player) => console.log("Player update not implemented in this context", player)}
          allPlayers={players}
        />
      );
    }
    
    if (content.viewType === "activity-detail" && content.activity) {
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
          relatedActivities={content.relatedActivities || []}
          cupMatches={content.cupMatches || []}
          allActivities={activities}
          onClose={() => onActivitySelect(null)}
          onMatchResultUpdate={onMatchResultUpdate}
          onPlayerSelect={onPlayerSelect}
        />
      );
    }
    
    if (content.viewType === "activities-list") {
      return (
        <ActivityList 
          activities={content.activities}
          players={players}
          onSelect={onActivitySelect}
          onPlayerSelect={onPlayerSelect}
          isHistorical={activeView === "historical"}
          isMobile={isMobile}
          noResultsMessage={content.searchQuery ? `Inga matcher hittades för "${content.searchQuery}"` : "Inga aktiviteter hittades"}
        />
      );
    }
  }
  
  return null;
}
