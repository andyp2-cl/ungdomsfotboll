
import { Activity, Player } from "@/types/player";
import { StatisticsTabsWrapper } from "@/components/player-management/statistics/StatisticsTabsWrapper";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetail } from "@/components/activity-detail";
import { useIsMobile } from "@/hooks/use-mobile";
import { PlayerPreview } from "@/components/player-preview/PlayerPreview";

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
  previousView?: "upcoming" | "historical" | "statistics";
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
  onMatchResultUpdate,
  previousView
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
    
    console.log("Statistics view rendering with onActivitySelect function:", !!onActivitySelect);
    
    return (
      <StatisticsTabsWrapper 
        players={players}
        activities={activities}
        gradeData={gradeData}
        onActivitySelect={(activity) => {
          console.log("Activity selected from StatisticsTabsWrapper:", activity.id, activity.name);
          onActivitySelect(activity);
        }}
        onPlayerSelect={(playerId) => {
          console.log("Player selected from StatisticsTabsWrapper:", playerId);
          onPlayerSelect(playerId);
        }}
      />
    );
  }
  
  // Handle view rendering based on content type
  if (content) {
    if (content.viewType === "player-detail" && content.player) {
      // Use the PlayerPreview component
      return (
        <PlayerPreview 
          player={content.player} 
          activities={activities}
          onClose={() => {
            console.log("Closing player preview from ActivityTabViewContent");
            onPlayerSelect("");
          }}
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
