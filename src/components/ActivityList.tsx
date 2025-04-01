
import React from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trophy, MapPin, User } from "lucide-react";

interface ActivityListProps {
  activities: Activity[];
  players: Player[];
  onSelect: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  isHistorical?: boolean;
  isMobile?: boolean;
}

export function ActivityList({ 
  activities, 
  players, 
  onSelect, 
  onPlayerSelect,
  isHistorical = false,
  isMobile = false
}: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Inga aktiviteter hittades</p>
      </div>
    );
  }
  
  // Get activity type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "match": return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "training": return "bg-green-100 text-green-800 hover:bg-green-200";
      case "cup": return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  // Get result badge color
  const getResultColor = (activity: Activity) => {
    if (!activity.isWin && activity.isWin !== false) return "bg-gray-100 text-gray-800";
    return activity.isWin 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };
  
  // Format date
  const formatActivityDate = (date: string) => {
    try {
      return format(new Date(date), isMobile ? "d/M" : "d MMM yyyy");
    } catch (e) {
      return date;
    }
  };
  
  // Get activity type in Swedish
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "match": return "Match";
      case "training": return "Träning";
      case "cup": return "Cup";
      default: return "Övrigt";
    }
  };

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
      {activities.map(activity => {
        // Get participant count
        const participantCount = activity.participants?.length || 0;
        
        // Format date and time
        const formattedDate = formatActivityDate(activity.date);
        
        // Get location name if available
        const locationName = activity.location?.name || "";
        
        // Get badge color for activity type
        const typeColor = getTypeColor(activity.type);
        
        // Get result text and color
        const hasResult = activity.result && !activity.result.includes('null') && !activity.result.includes('undefined');
        const resultColor = getResultColor(activity);
        
        // Is match type
        const isMatch = activity.type === "match";
        
        return (
          <Card 
            key={activity.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${isMobile ? 'p-2' : ''}`} 
            onClick={() => onSelect(activity)}
          >
            <CardHeader className={isMobile ? "pb-2 pt-3 px-3" : "pb-2"}>
              <div className="flex justify-between items-start">
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} truncate`}>{activity.name}</CardTitle>
                <Badge className={typeColor}>
                  {getTypeLabel(activity.type)}
                </Badge>
              </div>
              <CardDescription className="flex items-center">
                {formattedDate}
                {activity.time && <span className="ml-2">• {activity.time}</span>}
              </CardDescription>
            </CardHeader>
            
            <CardContent className={isMobile ? "px-3 py-1" : ""}>
              <div className="flex flex-col space-y-1">
                {locationName && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span className="truncate">{locationName}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 mr-1" />
                  <span>{participantCount} {participantCount === 1 ? "deltagare" : "deltagare"}</span>
                </div>
              </div>
            </CardContent>
            
            {isMatch && (
              <CardFooter className={isMobile ? "px-3 pt-1 pb-3" : "pt-1"}>
                <div className="flex justify-between w-full items-center">
                  {hasResult ? (
                    <Badge className={resultColor}>
                      <Trophy className="h-3.5 w-3.5 mr-1" />
                      {activity.result}
                    </Badge>
                  ) : isHistorical ? (
                    <span className="text-sm text-muted-foreground">Inget resultat</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Kommande</span>
                  )}
                  
                  {activity.kioskAssignedPlayerId && (
                    <Badge variant="outline" className="ml-auto">
                      Kiosk: {players.find(p => p.id === activity.kioskAssignedPlayerId)?.name?.split(' ')[0] || 'Tilldelad'}
                    </Badge>
                  )}
                </div>
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
}
