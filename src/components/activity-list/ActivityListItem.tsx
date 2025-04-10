
import React from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { CalendarClock, Users, MapPin, Award, Trophy } from "lucide-react";
import { Activity, Player } from "@/types/player";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ActivityParticipants } from "./ActivityParticipants";
import { CupMatchBadge } from "./CupMatchBadge";

// Helper function to format date nicely
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, "EEE d MMM", { locale: sv });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
};

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
  const { id, name, date, time, location, type, cupId, participants } = activity;
  
  const activityDate = formatDate(date);
  
  // Get participant player objects by IDs - making sure we only include valid players
  const participantPlayers = participants
    .map(id => players.find(p => p.id === id))
    .filter(player => player !== undefined) as Player[];
  
  const isCupMatch = cupId !== undefined;
  
  // Check if we have a match result
  const hasResult = activity.result !== undefined && activity.result !== "";
  const resultText = hasResult 
    ? `${activity.result}`
    : "";
    
  const isWin = activity.isWin;
  
  // Determine result style based on win/loss
  const resultStyle = isWin === undefined 
    ? "" 
    : isWin 
      ? "text-green-500 font-semibold" 
      : "text-red-500 font-semibold";
  
  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => onSelect(activity)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="text-lg font-semibold">{name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              <span>{activityDate}</span>
              {time && <span>• {time}</span>}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            {isCupMatch && <CupMatchBadge />}
            
            {/* Activity type indicator */}
            {type === "match" && !isCupMatch && (
              <div className="flex items-center text-sm">
                <Award className="h-4 w-4 mr-1" />
                <span>Match</span>
              </div>
            )}
            
            {/* Result display (if historical and has result) */}
            {isHistorical && hasResult && (
              <div className={`text-base ${resultStyle}`}>
                {resultText}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="flex flex-col gap-2">
          {/* Location info */}
          {location && (
            <div className="text-sm flex items-center text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{location.name}</span>
            </div>
          )}
          
          {/* Participants */}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <ActivityParticipants 
              players={participantPlayers}
              onPlayerSelect={onPlayerSelect}
              showCount={!isMobile}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
