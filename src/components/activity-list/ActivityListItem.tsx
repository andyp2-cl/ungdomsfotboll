
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Player } from "@/types/player";
import { ActivityParticipants } from "./ActivityParticipants";
import { Calendar, Clock, Map, Trophy, Users } from "lucide-react";
import { CupMatchBadge } from "./CupMatchBadge";

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
  isMobile = false 
}: ActivityListItemProps) {
  const { name, date, time, location, participants = [] } = activity;
  
  const formattedDate = new Date(date).toLocaleDateString('sv-SE');
  const dayOfWeek = new Date(date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  
  // Calculate the result message
  let resultMessage = '';
  if (isHistorical && activity.result) {
    resultMessage = `Resultat: ${activity.result}`;
  } else if (isHistorical && activity.homeScore !== undefined && activity.awayScore !== undefined) {
    resultMessage = `Resultat: ${activity.homeScore}-${activity.awayScore}`;
  }
  
  // Determine result color based on win/loss/draw
  const getResultTextColor = () => {
    // Draw
    if (activity.homeScore === activity.awayScore && 
        activity.homeScore !== undefined && 
        activity.awayScore !== undefined) {
      return "text-gray-600";
    }
    
    // Win/Loss based on stored value
    if (activity.isWin === true) {
      return "text-green-600";
    } else if (activity.isWin === false) {
      return "text-red-600";
    }
    
    // Default
    return "";
  };
  
  // Is this a cup match?
  const isCupMatch = activity.cupId ? true : false;
  
  // Get participant players from player IDs
  const participantPlayers = participants
    .map(id => players.find(p => p.id === id))
    .filter(player => player !== undefined) as Player[];

  return (
    <Card 
      className="border cursor-pointer relative hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={() => onSelect(activity)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <h3 className="font-bold text-base">{name}</h3>
            <div className="flex gap-2 items-center">
              {isCupMatch && <CupMatchBadge />}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{capitalizedDayOfWeek} {formattedDate}</span>
            </div>
            
            {time && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{time}</span>
              </div>
            )}
            
            {location?.name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Map className="h-4 w-4" />
                <span>{location.name}</span>
              </div>
            )}
          </div>
          
          {resultMessage && (
            <div className={`text-sm font-medium mt-1 ${getResultTextColor()}`}>
              {resultMessage}
            </div>
          )}
          
          <div className="mt-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Users className="h-4 w-4" />
              <span>{participants.length} deltagare</span>
            </div>
            <ActivityParticipants 
              participants={participantPlayers} 
              onPlayerSelect={onPlayerSelect}
              totalCount={participants.length}
              isMobile={isMobile}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
