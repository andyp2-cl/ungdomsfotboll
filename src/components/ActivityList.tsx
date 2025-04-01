
import { Activity, Player } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, UserCircle, MapPin, Trophy, Star } from "lucide-react";

interface ActivityListProps {
  activities: Activity[];
  players: Player[];
  onSelect: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function ActivityList({ activities, players, onSelect, onPlayerSelect }: ActivityListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const formatTime = (timeString?: string) => {
    return timeString || '??:??';
  };

  const getParticipantNames = (activity: Activity) => {
    if (!activity.participants?.length) return '0 deltagare';
    
    const participantCount = activity.participants.length;
    const participantPlayers = players.filter(
      player => activity.participants?.includes(player.id)
    );
    
    const displayCount = Math.min(3, participantCount);
    const displayNames = participantPlayers
      .slice(0, displayCount)
      .map(player => player.name)
      .join(', ');
    
    const remainingCount = participantCount - displayCount;
    
    return (
      <>
        {displayNames}
        {remainingCount > 0 && ` +${remainingCount} fler`}
      </>
    );
  };

  const renderParticipants = (activity: Activity) => {
    if (!activity.participants?.length) {
      return (
        <div className="text-xs text-muted-foreground mt-1 flex items-center">
          <Users className="h-3 w-3 mr-1" />
          <span>Inga deltagare ännu</span>
        </div>
      );
    }
    
    const participantPlayers = players.filter(
      player => activity.participants?.includes(player.id)
    );
    
    return (
      <div className="mt-2 flex flex-wrap gap-1">
        {participantPlayers.map(player => (
          <Badge 
            key={player.id} 
            variant="outline"
            className="text-xs py-0 h-5 cursor-pointer hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              if (onPlayerSelect) onPlayerSelect(player.id);
            }}
          >
            {player.image ? (
              <img 
                src={player.image} 
                alt={player.name} 
                className="h-3 w-3 rounded-full mr-1 object-cover"
              />
            ) : (
              <UserCircle className="h-3 w-3 mr-1" />
            )}
            {player.name}
          </Badge>
        ))}
      </div>
    );
  };

  const getKioskPlayerName = (activity: Activity) => {
    if (!activity.kioskAssignedPlayerId) return null;
    const player = players.find(p => p.id === activity.kioskAssignedPlayerId);
    return player ? player.name : "Okänd";
  };
  
  const renderGoalStats = (activity: Activity) => {
    if (!activity.playerStats?.goals) return null;
    
    const goalScorers = Object.entries(activity.playerStats.goals)
      .filter(([_, count]) => count > 0)
      .map(([playerId, count]) => {
        const player = players.find(p => p.id === playerId);
        return { 
          player: player ? player.name : "Okänd spelare", 
          count 
        };
      })
      .sort((a, b) => b.count - a.count);
      
    if (goalScorers.length === 0) return null;
    
    return (
      <div className="mt-2 text-xs">
        <div className="flex items-center text-green-700">
          <Trophy className="h-3 w-3 mr-1" />
          <span>Målskyttar:</span>
        </div>
        <div className="ml-4">
          {goalScorers.map((scorer, index) => (
            <div key={index}>
              {scorer.player} ({scorer.count})
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderAssistStats = (activity: Activity) => {
    if (!activity.playerStats?.assists) return null;
    
    const assisters = Object.entries(activity.playerStats.assists)
      .filter(([_, count]) => count > 0)
      .map(([playerId, count]) => {
        const player = players.find(p => p.id === playerId);
        return { 
          player: player ? player.name : "Okänd spelare", 
          count 
        };
      })
      .sort((a, b) => b.count - a.count);
      
    if (assisters.length === 0) return null;
    
    return (
      <div className="mt-2 text-xs">
        <div className="flex items-center text-blue-700">
          <Star className="h-3 w-3 mr-1" />
          <span>Assist:</span>
        </div>
        <div className="ml-4">
          {assisters.map((assister, index) => (
            <div key={index}>
              {assister.player} ({assister.count})
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Inga aktiviteter hittades</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activities.map((activity) => {
        const isHistorical = new Date(activity.date) < new Date(new Date().setHours(0, 0, 0, 0));
        const dayOfWeek = new Date(activity.date).toLocaleDateString('sv-SE', { weekday: 'short' });
        const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
        
        return (
          <Card 
            key={activity.id}
            className="hover:bg-accent/5 cursor-pointer transition-colors"
            onClick={() => onSelect(activity)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-sm line-clamp-1 mb-1">{activity.name}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{capitalizedDayOfWeek} {formatDate(activity.date)}</span>
                    {activity.time && (
                      <>
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        <span>{formatTime(activity.time)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={activity.type === "match" ? "default" : "secondary"} className="text-xs">
                    {activity.type === "match" ? "Match" : "Cup"}
                  </Badge>
                  {isHistorical && (
                    <Badge variant="outline" className="text-xs">
                      Tidigare
                    </Badge>
                  )}
                  {isHistorical && activity.type === "match" && activity.result && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                      {activity.result}
                    </Badge>
                  )}
                </div>
              </div>
              
              {activity.location && (
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{activity.location.name}</span>
                </div>
              )}
              
              {renderParticipants(activity)}
              
              {activity.type === "match" && activity.kioskAssignedPlayerId && (
                <div className="mt-2 text-xs flex items-center">
                  <Badge variant="outline" className="text-xs py-0 h-5">
                    Kiosk: {getKioskPlayerName(activity)}
                  </Badge>
                </div>
              )}
              
              {isHistorical && activity.type === "match" && (
                <>
                  {renderGoalStats(activity)}
                  {renderAssistStats(activity)}
                </>
              )}
              
              {activity.type === "cup" && activity.matches && activity.matches.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {activity.matches.length} matcher i cupen
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
