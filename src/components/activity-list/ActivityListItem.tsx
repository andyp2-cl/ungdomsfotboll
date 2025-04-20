
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Player } from "@/types/player";
import { ActivityParticipants } from "./ActivityParticipants";
import { Calendar, Clock, Map, Trophy, Users } from "lucide-react";
import { CupMatchBadge } from "./CupMatchBadge";
import { GradePieChart } from "../activity-detail/match-result/GradePieChart"; 
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityListItemProps {
  activity: Activity;
  players: Player[];
  onSelect: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isHistorical?: boolean;
}

export function ActivityListItem({ 
  activity, 
  players, 
  onSelect,
  onPlayerSelect,
  isHistorical = false
}: ActivityListItemProps) {
  const { name, date, time, location, participants = [] } = activity;
  const isMobile = useIsMobile();
  
  const formattedDate = new Date(date).toLocaleDateString('sv-SE');
  const dayOfWeek = new Date(date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  
  let resultMessage = '';
  if (isHistorical && activity.result) {
    resultMessage = `Resultat: ${activity.result}`;
  } else if (isHistorical && activity.homeScore !== undefined && activity.awayScore !== undefined) {
    resultMessage = `Resultat: ${activity.homeScore}-${activity.awayScore}`;
  }
  
  const getResultTextColor = () => {
    if (activity.homeScore === activity.awayScore && 
        activity.homeScore !== undefined && 
        activity.awayScore !== undefined) {
      return "text-gray-600";
    }
    
    if (activity.isWin === true) {
      return "text-green-600";
    } else if (activity.isWin === false) {
      return "text-red-600";
    }
    
    return "";
  };
  
  const isCupMatch = activity.cupId ? true : false;
  
  const participantPlayers = participants
    .map(id => players.find(p => p.id === id))
    .filter(player => player !== undefined) as Player[];

  const showGradeChart = participantPlayers.length > 0;

  return (
    <Card 
      className="border cursor-pointer relative hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={() => onSelect(activity)}
    >
      <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <h3 className={`font-bold ${isMobile ? 'text-base' : ''} flex items-center flex-wrap gap-2`}>
                {name}
                {isCupMatch && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5" />
                    Cupmatch
                  </Badge>
                )}
              </h3>
            </div>
            
            <div className={`flex flex-wrap gap-2 text-sm mt-2 ${isMobile ? 'text-xs' : ''}`}>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span>{capitalizedDayOfWeek} {formattedDate}</span>
              </div>
              
              {time && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span>{time}</span>
                </div>
              )}
              
              {location?.name && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Map className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span>{location.name}</span>
                </div>
              )}
            </div>
            
            <div className={`${isMobile ? 'mt-2' : 'mt-3'}`}>
              <ActivityParticipants 
                participants={participantPlayers} 
                onPlayerSelect={onPlayerSelect}
                totalCount={participants.length}
                isMobile={isMobile}
              />
            </div>
          </div>

          <div className="md:w-48 flex flex-col items-end justify-start">
            {resultMessage && (
              <div className={`${isMobile ? 'text-base font-medium mb-2' : 'text-sm font-medium mb-3'} ${getResultTextColor()}`}>
                {resultMessage}
              </div>
            )}
            
            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
              <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <span className={isMobile ? 'text-xs' : ''}>{participants.length} deltagare</span>
            </div>

            {showGradeChart && !isMobile && (
              <div className="w-24 h-24 overflow-hidden">
                <GradePieChart 
                  activity={activity} 
                  participatingPlayers={participantPlayers} 
                />
              </div>
            )}
            
            {showGradeChart && isMobile && (
              <div className="w-16 h-16 overflow-hidden">
                <GradePieChart 
                  activity={activity} 
                  participatingPlayers={participantPlayers} 
                  compact={true}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
