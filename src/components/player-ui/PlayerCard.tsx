
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { formatPositions, isTrainer } from "@/utils/positionUtils";

interface PlayerCardProps {
  player: Player;
  onSelect?: () => void;
  onEdit?: () => void;
  action?: React.ReactNode;
  compact?: boolean;
  showStats?: boolean;
  activities?: Activity[]; // Add activities prop to calculate winrate
}

export function PlayerCard({ 
  player, 
  onSelect, 
  onEdit, 
  action, 
  compact = false,
  showStats = false,
  activities = []
}: PlayerCardProps) {
  // Get real activity count that excludes kiosk duty assignments
  const getActivityCount = () => {
    if (!player.activities) return 0;
    return player.activities.length;
  };

  // Calculate winrate from player's matches
  const getPlayerWinRate = () => {
    if (!activities.length) return 0;
    
    const playerMatches = activities.filter(activity => 
      activity.type === "match" && 
      activity.participants?.includes(player.id)
    );
    
    if (playerMatches.length === 0) return 0;
    
    const stats = calculatePlayerStats(player, playerMatches);
    return stats.winRate;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-500 hover:bg-green-600';
      case 'B':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'C':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'D':
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const isCoach = isTrainer(player.positions);
  const winRate = getPlayerWinRate();

  if (compact) {
    return (
      <div 
        className={`flex justify-between items-center p-3 rounded-md border hover:bg-muted/50 transition-colors ${onSelect ? 'cursor-pointer' : ''}`}
        onClick={onSelect}
      >
        <div className="flex items-center gap-2">
          {player.image ? (
            <img 
              src={player.image} 
              alt={player.name} 
              className="h-12 w-12 rounded-full object-cover"
              loading="lazy"
              crossOrigin="anonymous"
            />
          ) : (
            <UserCircle className="h-12 w-12 text-muted-foreground" />
          )}
          <div>
            <div className="font-medium text-sm flex items-center">
              {player.name}
              {player.jerseyNumber && !isCoach && (
                <span className="ml-1 text-xs bg-gray-200 text-gray-800 px-1 py-0.5 rounded-full">
                  #{player.jerseyNumber}
                </span>
              )}
            </div>
            {!isCoach && player.positions && (
              <div className="text-xs text-muted-foreground">
                {formatPositions(player.positions, true)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isCoach ? (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
              Tränare
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Nivå {player.grade}
            </Badge>
          )}
          
          {action && (
            <div onClick={e => e.stopPropagation()}>
              {action}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card 
      className={`overflow-hidden ${onSelect ? 'cursor-pointer' : ''} hover:border-primary transition-colors ${isCoach ? 'border-amber-300' : ''}`}
      onClick={onSelect}
    >
      <div className="aspect-[3/2] bg-muted relative">
        {player.image ? (
          <img 
            src={player.image} 
            alt={player.name} 
            className="w-full h-full object-cover"
            loading="lazy"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <UserCircle className="h-20 w-20 text-muted-foreground/50" />
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          {isCoach ? (
            <Badge className="bg-amber-500 hover:bg-amber-600">
              Tränare
            </Badge>
          ) : (
            <Badge className={getGradeColor(player.grade || '')}>
              Nivå {player.grade}
            </Badge>
          )}
        </div>
        
        {/* Show winrate badge for non-coaches */}
        {!isCoach && winRate > 0 && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-white/90 text-primary border-primary">
              {winRate}% vinster
            </Badge>
          </div>
        )}
        
        {action && (
          <div className="absolute bottom-2 left-2" onClick={e => e.stopPropagation()}>
            {action}
          </div>
        )}
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-semibold truncate">
          {player.name}
          {player.jerseyNumber && !isCoach && (
            <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full">
              #{player.jerseyNumber}
            </span>
          )}
        </h3>
        {!isCoach && (
          <p className="text-sm text-muted-foreground">
            {player.positions && player.positions.length > 0
              ? formatPositions(player.positions, true)
              : 'Ingen position definierad'}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-between">
        <span className="text-xs text-muted-foreground">
          {getActivityCount() === 0
            ? "Inga aktiviteter"
            : `${getActivityCount()} aktiviteter`}
        </span>
        
        {showStats && player.matches !== undefined && (
          <span className="text-xs text-muted-foreground">
            {player.matches} matcher
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
