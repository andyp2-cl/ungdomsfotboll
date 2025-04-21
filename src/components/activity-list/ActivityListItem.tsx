
import React from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users, Shield } from "lucide-react";
import { formatParticipantsCount } from "@/utils/activityHelpers";
import { Badge } from "@/components/ui/badge";
import { ActivityParticipants } from "./ActivityParticipants";
import { CupMatchBadge } from "./CupMatchBadge";

interface ActivityListItemProps {
  activity: Activity;
  players: Player[];
  onSelect: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isMobile?: boolean;
  isHistorical?: boolean;
}

export function ActivityListItem({ 
  activity, 
  players,
  onSelect,
  onPlayerSelect,
  isMobile = false,
  isHistorical = false
}: ActivityListItemProps) {
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };
  
  // Format location display
  const location = activity.location?.name || 'Plats ej angiven';
  
  // Count participants
  const participantCount = activity.participants?.length || 0;
  
  // Card click handler
  const handleCardClick = () => {
    onSelect(activity);
  };
  
  // For mobile, we want a more compact layout
  const iconClass = isMobile ? "h-4 w-4" : "h-5 w-5";
  const textClass = isMobile ? "text-sm" : "text-base";
  
  return (
    <Card 
      className="hover:bg-accent/5 transition-colors cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 pb-0">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg line-clamp-2">{activity.name}</h3>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-1">
              {activity.type === "match" && (
                <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-100">Match</Badge>
              )}
              
              {activity.type === "cup" && (
                <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-100">Cup</Badge>
              )}
              
              {activity.type === "match" && activity.cupName && (
                <CupMatchBadge cupName={activity.cupName} />
              )}
              
              {activity.result && (
                <Badge variant={activity.isWin ? "success" : activity.isWin === false ? "destructive" : "outline"}>
                  {activity.result}
                </Badge>
              )}
              
              {activity.league_id && activity.leagueName && (
                <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-100 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {activity.leagueName}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className={iconClass} />
              <span className={textClass}>{formatDate(activity.date)}</span>
            </div>
            
            {activity.time && (
              <div className="flex items-center gap-2">
                <Clock className={iconClass} />
                <span className={textClass}>{activity.time}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <MapPin className={iconClass} />
              <span className={textClass}>{location}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className={iconClass} />
              <span className={textClass}>{formatParticipantsCount(participantCount)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 border-t bg-muted/30 flex justify-between">
        <ActivityParticipants 
          activity={activity}
          players={players}
          onPlayerSelect={onPlayerSelect}
        />
      </CardFooter>
    </Card>
  );
}
