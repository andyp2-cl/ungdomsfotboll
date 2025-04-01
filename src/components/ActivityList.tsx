
import { Activity, Player } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, MapPin, ChevronRight, UserCircle, Coffee } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityListProps {
  activities: Activity[];
  players: Player[];
  onSelect: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function ActivityList({ activities, players, onSelect, onPlayerSelect }: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Inga aktiviteter hittades.</p>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE');
  };
  
  const sortedActivities = [...activities].sort((a, b) => {
    // Sort by date, then by time if available
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    
    return 0;
  });
  
  const formatResult = (activity: Activity) => {
    if (activity.goalsScored !== undefined && activity.goalsConceded !== undefined) {
      return `${activity.goalsScored}-${activity.goalsConceded}`;
    }
    return activity.result || "";
  };

  const groupedActivities: { [key: string]: Activity[] } = {};
  
  // Group activities by month
  sortedActivities.forEach(activity => {
    const date = new Date(activity.date);
    const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!groupedActivities[month]) {
      groupedActivities[month] = [];
    }
    
    groupedActivities[month].push(activity);
  });

  // Get month names and sort keys
  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-').map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' });
  };
  
  const sortedMonthKeys = Object.keys(groupedActivities).sort((a, b) => {
    const [yearA, monthA] = a.split('-').map(Number);
    const [yearB, monthB] = b.split('-').map(Number);
    
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    
    return monthA - monthB;
  });

  return (
    <div className="space-y-6">
      {sortedMonthKeys.map(monthKey => (
        <div key={monthKey} className="space-y-2">
          <h3 className="font-semibold text-lg">{getMonthName(monthKey)}</h3>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-2">
              {groupedActivities[monthKey].map(activity => {
                const formattedDate = formatDate(activity.date);
                const dayOfWeek = new Date(activity.date).toLocaleDateString('sv-SE', { weekday: 'short' });
                const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
                
                const participantCount = activity.participants?.length || 0;
                const isKioskDuty = activity.kioskAssignedPlayerId != null;
                
                const kioskPlayer = activity.kioskAssignedPlayerId 
                  ? players.find(p => p.id === activity.kioskAssignedPlayerId) 
                  : undefined;
                
                const isPastActivity = new Date(activity.date) < new Date(new Date().setHours(0, 0, 0, 0));
                const hasResult = activity.type === 'match' && (formatResult(activity) || isPastActivity);
                
                return (
                  <Card key={activity.id} className="hover:bg-accent/5 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-2">
                        <div className="flex-grow space-y-1">
                          <div className="flex justify-between sm:justify-start sm:gap-3 items-center">
                            <h4 className="font-medium">{activity.name}</h4>
                            <div className="flex flex-wrap gap-1.5">
                              <Badge 
                                variant={activity.type === "match" ? "default" : "secondary"}
                              >
                                {activity.type === "match" ? "Match" : "Cup"}
                              </Badge>
                              
                              {isPastActivity && (
                                <Badge variant="outline">Tidigare</Badge>
                              )}
                              
                              {hasResult && formatResult(activity) && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                  {formatResult(activity)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              <span>{capitalizedDayOfWeek} {formattedDate}</span>
                            </div>
                            
                            {activity.time && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{activity.time}</span>
                              </div>
                            )}
                            
                            {activity.location && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{activity.location.name}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            {participantCount > 0 && (
                              <Badge variant="outline" className="text-xs py-0 px-1.5">
                                {participantCount} deltagare
                              </Badge>
                            )}
                            
                            {isKioskDuty && kioskPlayer && (
                              <Badge 
                                variant="outline" 
                                className="text-xs py-0 px-1.5 flex items-center gap-1 bg-amber-50 text-amber-800 border-amber-200"
                              >
                                <Coffee className="h-3 w-3" />
                                <span>Kiosk: {kioskPlayer.name}</span>
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end sm:flex-col sm:justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full sm:w-auto"
                            onClick={() => onSelect(activity)}
                          >
                            Visa <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                      
                      {activity.participants && activity.participants.length > 0 && (
                        <div className="mt-3 pt-2 border-t flex flex-wrap gap-1">
                          {activity.participants.slice(0, 10).map(participantId => {
                            const player = players.find(p => p.id === participantId);
                            if (!player) return null;
                            
                            return (
                              <div 
                                key={player.id}
                                className="flex items-center space-x-1 rounded-full bg-muted px-2 py-1 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onPlayerSelect) onPlayerSelect(player.id);
                                }}
                                title={player.name}
                                role="button"
                                tabIndex={0}
                              >
                                {player.image ? (
                                  <img 
                                    src={player.image} 
                                    alt={player.name} 
                                    className="h-4 w-4 rounded-full object-cover"
                                  />
                                ) : (
                                  <UserCircle className="h-4 w-4 text-gray-400" />
                                )}
                                <span>{player.name}</span>
                              </div>
                            );
                          })}
                          
                          {activity.participants.length > 10 && (
                            <div className="rounded-full bg-muted px-2 py-1 text-xs">
                              +{activity.participants.length - 10} fler
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
