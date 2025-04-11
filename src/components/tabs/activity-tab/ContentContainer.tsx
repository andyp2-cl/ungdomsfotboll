
import { Activity, Player } from "@/types/player";
import { ActivityDetail } from "@/components/activity-detail";
import { ActivityList } from "@/components/activity-list";
import { PlayerDetail } from "@/components/PlayerDetail";
import { StatisticsTabsWrapper } from "@/components/player-management/statistics/StatisticsTabsWrapper";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContentContainerProps {
  activeView: "upcoming" | "historical" | "statistics";
  selectedPlayer: Player | null;
  selectedActivity: Activity | null;
  activities: Activity[];
  players: Player[];
  filteredActivities: Activity[];
  searchQuery: string;
  isHistorical: boolean;
  gradeData: { grade: string, players: number }[];
  relatedActivities: Activity[];
  cupMatches: Activity[];
  
  onPlayerSelect: (playerId: string) => void;
  onActivitySelect: (activity: Activity | null) => void;
  onPlayerUpdate: (player: Player) => void;
  onActivityUpdate: (activity: Activity) => void;
  onEditActivity: (activity: Activity | null) => void;
  onDeleteActivity: (activityId: string) => Promise<boolean>;
  onKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  onClosePlayerDetail: () => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function ContentContainer({
  activeView,
  selectedPlayer,
  selectedActivity,
  activities,
  players,
  filteredActivities,
  searchQuery,
  isHistorical,
  gradeData,
  relatedActivities,
  cupMatches,
  
  onPlayerSelect,
  onActivitySelect,
  onPlayerUpdate,
  onActivityUpdate,
  onEditActivity,
  onDeleteActivity,
  onKioskAssignmentUpdate,
  onClosePlayerDetail,
  onMatchResultUpdate
}: ContentContainerProps) {
  const isMobile = useIsMobile();

  if (selectedPlayer) {
    return (
      <PlayerDetail 
        player={selectedPlayer} 
        activities={activities} 
        onClose={onClosePlayerDetail}
        onEdit={(player) => console.log("Edit player not implemented in this context", player)}
        onPlayerUpdate={onPlayerUpdate}
        allPlayers={players}
      />
    );
  }
  
  if (selectedActivity) {
    return (
      <ActivityDetail 
        activity={selectedActivity}
        players={players}
        onBack={() => onActivitySelect(null)}
        onEdit={onEditActivity}
        onDeleteActivity={onDeleteActivity}
        onActivityUpdate={onActivityUpdate}
        onKioskAssignmentUpdate={onKioskAssignmentUpdate}
        onActivitySelect={onActivitySelect}
        relatedActivities={relatedActivities}
        cupMatches={cupMatches}
        allActivities={activities}
        onClose={() => onActivitySelect(null)}
        onMatchResultUpdate={onMatchResultUpdate}
        onPlayerSelect={onPlayerSelect}
      />
    );
  }
  
  if (activeView === "statistics") {
    return (
      <StatisticsTabsWrapper 
        players={players}
        activities={activities}
        gradeData={gradeData}
      />
    );
  }
  
  return (
    <ActivityList 
      activities={filteredActivities}
      players={players}
      onSelect={onActivitySelect}
      onPlayerSelect={onPlayerSelect}
      isHistorical={isHistorical}
      isMobile={isMobile}
      noResultsMessage={searchQuery ? `Inga matcher hittades för "${searchQuery}"` : "Inga aktiviteter hittades"}
    />
  );
}
