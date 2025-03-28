import { Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MapPin, Coffee, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

interface ActivityListProps {
  activities: Activity[];
  onSelect?: (activity: Activity) => void;
  players?: any[]; // Optional players to show kiosk assignments
}

export function ActivityList({ activities, onSelect, players = [] }: ActivityListProps) {
  // Sort activities by date
  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      // Sort by date first
      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      
      // If dates are the same, sort by time if available
      if (dateComparison === 0 && a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      
      return dateComparison;
    });
  }, [activities]);

  if (!activities.length) {
    return <p className="text-muted-foreground text-center p-4">Inga aktiviteter hittades</p>;
  }

  // Get day of week in Swedish
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString('sv-SE', { weekday: 'long' });
    return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  };

  // Check if an activity is eligible for kiosk assignment (home match at Österås IP)
  const isKioskEligible = (activity: Activity): boolean => {
    if (!activity.location) return false;
    
    // Check if it's a home match at Österås IP
    const isAtÖsteråsIP = activity.location.name.includes('Österås IP');
    const isHomeMatch = activity.name.toLowerCase().startsWith('hässleholms if');
    
    return isAtÖsteråsIP && isHomeMatch;
  };

  // Get assigned kiosk player name
  const getKioskPlayerName = (activity: Activity): string => {
    if (!activity.kioskAssignedPlayerId) return "";
    const player = players.find(p => p.id === activity.kioskAssignedPlayerId);
    return player ? player.name : "Okänd spelare";
  };
  
  // Get participant names for an activity
  const getParticipantNames = (activity: Activity): string[] => {
    if (!activity.participants || activity.participants.length === 0) return [];
    
    return activity.participants
      .map(participantId => {
        const player = players.find(p => p.id === participantId);
        return player ? player.name : null;
      })
      .filter(name => name !== null) as string[];
  };

  return (
    <div className="space-y-4">
      {sortedActivities.map((activity) => {
        const isEligibleForKiosk = isKioskEligible(activity);
        const kioskPlayerName = getKioskPlayerName(activity);
        const participantNames = getParticipantNames(activity);
        
        return (
          <Card key={activity.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                {activity.name}
                <Badge 
                  variant={activity.type === "match" ? "default" : "secondary"}
                  className="ml-2"
                >
                  {activity.type === "match" ? "Match" : "Cup"}
                </Badge>
              </CardTitle>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {getDayOfWeek(activity.date)} {new Date(activity.date).toLocaleDateString('sv-SE')}
                  {activity.time && (
                    <span className="flex items-center ml-2">
                      <Clock className="h-4 w-4 ml-2 mr-1" />
                      {activity.time}
                    </span>
                  )}
                </div>
                
                {activity.location && (
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{activity.location.name}</span>
                    {activity.location.description && (
                      <span className="text-muted-foreground ml-1">({activity.location.description})</span>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {participantNames.length > 0 ? (
                <div className="text-sm">
                  <div className="flex items-start gap-1 mb-1">
                    <Users className="h-4 w-4 mt-0.5 mr-1" />
                    <span className="font-medium">{participantNames.length} deltagare:</span>
                  </div>
                  <div className="ml-5 flex flex-wrap gap-1">
                    {participantNames.map((name, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-muted-foreground">Inga deltagare</span>
                </div>
              )}
              
              {isEligibleForKiosk && (
                <div className="mt-2 flex items-center text-sm">
                  <Coffee className="h-4 w-4 mr-1" />
                  <span>
                    {activity.kioskAssignedPlayerId 
                      ? <span>Kioskansvarig: <Badge variant="default">{kioskPlayerName}</Badge></span>
                      : <span className="text-muted-foreground">Ingen kioskansvarig tilldelad</span>
                    }
                  </span>
                </div>
              )}
            </CardContent>
            {onSelect && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSelect(activity)}
                  className="w-full"
                >
                  Visa detaljer
                </Button>
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
}
