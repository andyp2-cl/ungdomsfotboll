
import { Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MapPin, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockKioskSchedules } from "@/data/mockData";

interface ActivityListProps {
  activities: Activity[];
  onSelect?: (activity: Activity) => void;
  players?: any[]; // Optional players to show kiosk assignments
}

export function ActivityList({ activities, onSelect, players = [] }: ActivityListProps) {
  if (!activities.length) {
    return <p className="text-muted-foreground text-center p-4">Inga aktiviteter hittades</p>;
  }

  // Get day of week in Swedish
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString('sv-SE', { weekday: 'long' });
    return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  };

  // Get kiosk assignments for an activity
  const getKioskAssignments = (activity: Activity) => {
    if (!activity.kioskScheduleId) return [];

    const schedule = mockKioskSchedules.find(s => s.id === activity.kioskScheduleId);
    if (!schedule) return [];

    return schedule.slots
      .filter(slot => slot.assignedPlayerId)
      .map(slot => {
        const player = players.find(p => p.id === slot.assignedPlayerId);
        return {
          time: slot.time,
          playerName: player ? player.name : "Okänd spelare"
        };
      });
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const kioskAssignments = getKioskAssignments(activity);
        
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
              <div className="text-sm">
                {activity.participants && activity.participants.length > 0 
                  ? `${activity.participants.length} deltagare`
                  : "Inga deltagare"}
              </div>
              
              {kioskAssignments.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center text-sm font-medium">
                    <Coffee className="h-4 w-4 mr-1" />
                    <span>Kioskpass:</span>
                  </div>
                  <div className="ml-5 mt-1 text-sm">
                    {kioskAssignments.map((assignment, index) => (
                      <div key={index} className="text-muted-foreground">
                        {assignment.time}: {assignment.playerName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activity.kioskScheduleId && kioskAssignments.length === 0 && (
                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                  <Coffee className="h-4 w-4 mr-1" />
                  <span>Har kioskschema (inga tilldelade pass)</span>
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
