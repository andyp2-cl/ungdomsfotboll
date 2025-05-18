
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Player } from "@/types/player";
import { ActivityParticipants } from "./ActivityParticipants";
import { sortPlayersByGrade } from "@/utils/gradeUtils";
import { ActivityHeader } from "./ActivityHeader";
import { ActivityMeta } from "./ActivityMeta";
import { ActivitySidebar } from "./ActivitySidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityListItemProps {
  activity: Activity;
  players: Player[];
  onSelect: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isHistorical?: boolean;
  isMobile?: boolean;
}

export function ActivityListItem({ 
  activity, 
  players, 
  onSelect,
  onPlayerSelect,
  isHistorical = false,
  isMobile
}: ActivityListItemProps) {
  // Use the hook only if isMobile is not provided
  const mobileFromHook = useIsMobile();
  // Use passed isMobile prop if provided, otherwise use the hook value
  const isMobileView = isMobile !== undefined ? isMobile : mobileFromHook;
  
  const { name, date, time, location, participants = [] } = activity;
  
  const isCupMatch = activity.cupId ? true : false;
  
  const participantPlayers = sortPlayersByGrade(
    participants
      .map(id => players.find(p => p.id === id))
      .filter(player => player !== undefined) as Player[]
  );

  const handleCardClick = () => {
    // Scroll to the top of the window before selecting the activity
    window.scrollTo(0, 0);
    onSelect(activity);
  };

  return (
    <Card 
      className="border cursor-pointer relative hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={handleCardClick}
    >
      <CardContent className={`${isMobileView ? 'p-3' : 'p-4'}`}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <ActivityHeader 
                name={name} 
                isCupMatch={isCupMatch} 
                leagueId={activity.leagueId}
                isMobileView={isMobileView}
              />
            </div>
            
            <ActivityMeta 
              date={date} 
              time={time} 
              location={location} 
              isMobile={isMobileView} 
            />
            
            <div className={`${isMobileView ? 'mt-2' : 'mt-3'} flex-grow`}>
              <ActivityParticipants 
                participants={participantPlayers} 
                // Explicitly pass undefined to ensure no click handling
                onPlayerSelect={undefined}
                totalCount={participants.length}
                isMobile={isMobileView}
                showAll={true}
              />
            </div>
          </div>

          <ActivitySidebar 
            activity={activity}
            participantPlayers={participantPlayers}
            totalParticipants={participants.length}
            isHistorical={isHistorical}
            isMobileView={isMobileView}
          />
        </div>
      </CardContent>
    </Card>
  );
}
