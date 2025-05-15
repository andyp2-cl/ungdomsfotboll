
import React from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import { GradePieChart } from "@/components/activity-detail/match-result/GradePieChart";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayerAvatar } from "@/components/player-selection/PlayerAvatar";

interface ActivityPreviewProps {
  activity: Activity;
  participatingPlayers: Player[];
  onClose: () => void;
  onViewFullActivity?: () => void;
}

export function ActivityPreview({
  activity,
  participatingPlayers,
  onClose,
  onViewFullActivity
}: ActivityPreviewProps) {
  // Function to get goal scorers from player stats
  const getGoalScorers = () => {
    if (!activity.player_stats?.goals) return [];
    
    // Get player IDs who scored, mapped to their goal count
    const scorers = Object.entries(activity.player_stats.goals)
      .filter(([_, goals]) => goals && goals > 0)
      .map(([playerId, goals]) => {
        const player = participatingPlayers.find(p => p.id === playerId);
        return {
          playerId,
          playerName: player?.name || "Unknown Player",
          goals: goals as number
        };
      })
      .sort((a, b) => b.goals - a.goals); // Sort by most goals
      
    return scorers;
  };

  const goalScorers = getGoalScorers();
  const hasGoalScorers = goalScorers.length > 0;

  return (
    <Card className="w-full max-w-lg mx-auto relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={onClose}
      >
        <span className="sr-only">Close</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </Button>
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{activity.name}</CardTitle>
          {activity.type && (
            <Badge variant="outline" className="ml-2">
              {activity.type === 'match' ? 'Match' : 
               activity.type === 'cup' ? 'Cup' : 
               activity.type === 'training' ? 'Träning' : 
               activity.type}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pb-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{formatDate(activity.date)}</span>
            {activity.time && (
              <span className="ml-1 text-muted-foreground">{activity.time}</span>
            )}
          </div>
          
          {activity.location && activity.location.name && (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>{activity.location.name}</span>
            </div>
          )}
        </div>
        
        {activity.type === 'match' && (
          <div className="border-t pt-3 mt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">Matchresultat</span>
              {activity.homeScore !== undefined && activity.awayScore !== undefined ? (
                <Badge className={
                  activity.isWin ? "bg-green-100 text-green-800" : 
                  activity.isWin === false ? "bg-red-100 text-red-800" : 
                  "bg-blue-100 text-blue-800"
                }>
                  {activity.homeScore} - {activity.awayScore}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-xs">Inget resultat</span>
              )}
            </div>
            
            {/* Goal scorers section */}
            {hasGoalScorers && (
              <div className="mt-3">
                <div className="flex items-center mb-1.5">
                  <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="text-sm font-medium">Målskyttar</span>
                </div>
                <div className="text-sm pl-6 space-y-1">
                  {goalScorers.map((scorer) => (
                    <div key={scorer.playerId} className="flex justify-between">
                      <span>{scorer.playerName}</span>
                      <span className="font-semibold">{scorer.goals}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="font-medium text-sm">Deltagare ({participatingPlayers.length})</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <GradePieChart 
              activity={activity}
              participatingPlayers={participatingPlayers}
              compact={true}
            />
            
            <ScrollArea className="h-[100px]">
              <div className="flex flex-wrap gap-3 pt-1">
                {participatingPlayers.map((player) => (
                  <div key={player.id} className="flex flex-col items-center gap-1">
                    <PlayerAvatar player={player} size="md" />
                    <span className="text-xs">{player.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {onViewFullActivity && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3"
            onClick={onViewFullActivity}
          >
            Visa full aktivitet
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
