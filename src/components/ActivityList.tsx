import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MapPin, Coffee, Users, Goal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

interface ActivityListProps {
  activities: Activity[];
  onSelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  players?: Player[];
}

export function ActivityList({ activities, onSelect, onPlayerSelect, players = [] }: ActivityListProps) {
  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const dateComparison = dateA.getTime() - dateB.getTime();
      
      if (dateComparison === 0 && a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      
      return dateComparison;
    });
  }, [activities]);

  if (!activities.length) {
    return <p className="text-muted-foreground text-center p-4">Inga aktiviteter hittades</p>;
  }

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString('sv-SE', { weekday: 'long' });
    return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  };

  const isKioskEligible = (activity: Activity): boolean => {
    if (!activity.location) return false;
    
    const isAtÖsteråsIP = activity.location.name.includes('Österås IP');
    const isHomeMatch = activity.name.toLowerCase().startsWith('hässleholms if');
    
    return isAtÖsteråsIP && isHomeMatch;
  };

  const getKioskPlayerName = (activity: Activity): string => {
    if (!activity.kioskAssignedPlayerId) return "";
    const player = players.find(p => p.id === activity.kioskAssignedPlayerId);
    return player ? player.name : "Okänd spelare";
  };

  const getParticipantNames = (activity: Activity): string[] => {
    if (!activity.participants || activity.participants.length === 0) return [];
    
    return activity.participants
      .map(participantId => {
        const player = players.find(p => p.id === participantId);
        return player ? player.name : null;
      })
      .filter(name => name !== null) as string[];
  };

  const isHistorical = (dateString: string): boolean => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getGoalScorers = (activity: Activity): { name: string, goals: number }[] => {
    if (!activity.playerStats?.goals) return [];
    
    const goalScorers: { name: string, goals: number }[] = [];
    
    Object.entries(activity.playerStats.goals).forEach(([playerId, goals]) => {
      if (goals > 0) {
        const player = players.find(p => p.id === playerId);
        if (player) {
          goalScorers.push({ name: player.name, goals });
        }
      }
    });
    
    return goalScorers.sort((a, b) => b.goals - a.goals);
  };

  const getAssistProviders = (activity: Activity): { name: string, assists: number }[] => {
    if (!activity.playerStats?.assists) return [];
    
    const assistProviders: { name: string, assists: number }[] = [];
    
    Object.entries(activity.playerStats.assists).forEach(([playerId, assists]) => {
      if (assists > 0) {
        const player = players.find(p => p.id === playerId);
        if (player) {
          assistProviders.push({ name: player.name, assists });
        }
      }
    });
    
    return assistProviders.sort((a, b) => b.assists - a.assists);
  };

  const getTotalGoals = (activity: Activity): number => {
    if (!activity.playerStats?.goals) return 0;
    return Object.values(activity.playerStats.goals).reduce((sum, goals) => sum + goals, 0);
  };

  const getTotalAssists = (activity: Activity): number => {
    if (!activity.playerStats?.assists) return 0;
    return Object.values(activity.playerStats.assists).reduce((sum, assists) => sum + assists, 0);
  };

  return (
    <div className="space-y-4">
      {sortedActivities.map((activity) => {
        const isEligibleForKiosk = isKioskEligible(activity);
        const kioskPlayerName = getKioskPlayerName(activity);
        const participantNames = getParticipantNames(activity);
        const activityIsHistorical = isHistorical(activity.date);
        const goalScorers = getGoalScorers(activity);
        const assistProviders = getAssistProviders(activity);
        const totalGoals = getTotalGoals(activity);
        const totalAssists = getTotalAssists(activity);
        
        return (
          <Card key={activity.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {activity.name}
                  {activityIsHistorical && activity.type === "match" && activity.result && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      {activity.result}
                    </Badge>
                  )}
                  {activityIsHistorical && activity.type === "match" && totalGoals > 0 && (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      {totalGoals} mål
                    </Badge>
                  )}
                </div>
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
                    {participantNames.map((name, index) => {
                      const playerId = activity.participants && activity.participants[index];
                      return (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-gray-100"
                          onClick={() => onPlayerSelect && playerId && onPlayerSelect(playerId)}
                        >
                          {name}
                        </Badge>
                      );
                    })}
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
                      ? (
                        <span>
                          Kioskansvarig: {' '}
                          <Badge 
                            variant="default" 
                            className="cursor-pointer hover:bg-blue-600"
                            onClick={() => onPlayerSelect && activity.kioskAssignedPlayerId && onPlayerSelect(activity.kioskAssignedPlayerId)}
                          >
                            {kioskPlayerName}
                          </Badge>
                        </span>
                      )
                      : <span className="text-muted-foreground">Ingen kioskansvarig tilldelad</span>
                    }
                  </span>
                </div>
              )}

              {activityIsHistorical && activity.type === "match" && (
                <div className="mt-2 text-sm">
                  {goalScorers.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center font-medium mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                          <path d="M12 2v6M12 22v-6M4.93 10.93l4.24 4.24M14.83 8.83l4.24 4.24M2 12h6M16 12h6M10.93 19.07l4.24-4.24M8.83 9.17l4.24-4.24"/>
                        </svg>
                        Målskyttar:
                      </div>
                      <div className="ml-5 flex flex-wrap gap-1">
                        {goalScorers.map((scorer, index) => {
                          const playerId = Object.entries(activity.playerStats?.goals || {})
                            .find(([id, goals]) => {
                              const player = players.find(p => p.id === id);
                              return player && player.name === scorer.name;
                            })?.[0];
                            
                          return (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs bg-green-50 border-green-200 text-green-700 cursor-pointer hover:bg-green-100"
                              onClick={() => onPlayerSelect && playerId && onPlayerSelect(playerId)}
                            >
                              {scorer.name} ({scorer.goals})
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {assistProviders.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center font-medium mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        Assist:
                      </div>
                      <div className="ml-5 flex flex-wrap gap-1">
                        {assistProviders.map((provider, index) => {
                          const playerId = Object.entries(activity.playerStats?.assists || {})
                            .find(([id, assists]) => {
                              const player = players.find(p => p.id === id);
                              return player && player.name === provider.name;
                            })?.[0];
                            
                          return (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs bg-blue-50 border-blue-200 text-blue-700 cursor-pointer hover:bg-blue-100"
                              onClick={() => onPlayerSelect && playerId && onPlayerSelect(playerId)}
                            >
                              {provider.name} ({provider.assists})
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
