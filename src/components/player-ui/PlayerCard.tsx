import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { formatPositions, isTrainer } from "@/utils/positionUtils";
import { PlayerStatusIndicator } from "@/components/player-status/PlayerStatusIndicator";

interface PlayerCardProps {
  player: Player;
  onSelect?: () => void;
  onEdit?: () => void;
  action?: React.ReactNode;
  compact?: boolean;
  showStats?: boolean;
  activities?: Activity[]; // Add activities prop to calculate winrate
  isMobile?: boolean; // Ny prop
}

export function PlayerCard({ 
  player, 
  onSelect, 
  onEdit, 
  action, 
  compact = false,
  showStats = false,
  activities = [],
  isMobile = false // Ny prop
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
  const isActive = player.isActive !== undefined ? player.isActive : true;

  // Super kompakt mobil vy - mycket mindre kort för att visa många spelare
  if (compact && isMobile) {
    return (
      <div 
        className={`flex items-center gap-1.5 p-1 rounded border hover:bg-muted/30 transition-colors min-w-0 ${
          onSelect ? 'cursor-pointer' : ''
        } ${!isActive ? 'opacity-60 bg-gray-50/50' : ''}`}
        onClick={onSelect}
        style={{ minHeight: '28px' }}
      >
        <div className={`${!isActive ? 'grayscale opacity-70' : ''} shrink-0`}>
          {player.image ? (
            <img 
              src={player.image} 
              alt={player.name} 
              className="h-5 w-5 rounded-full object-cover"
              loading="lazy"
              crossOrigin="anonymous"
            />
          ) : (
            <UserCircle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1 flex items-center gap-1">
          <span className={`font-medium text-xs truncate ${!isActive ? 'text-gray-500' : ''}`}>
            {player.name}
          </span>
          {!isCoach && (
            <Badge className={`text-[7px] px-0.5 py-0 h-3 ${
              !isActive ? 'bg-gray-400 hover:bg-gray-500' : getGradeColor(player.grade || '')
            }`}>
              {player.grade}
            </Badge>
          )}
          {winRate > 0 && !isCoach && (
            <span className={`text-[8px] font-semibold ${!isActive ? 'text-gray-400' : 'text-green-600'}`}>
              {winRate}%
            </span>
          )}
        </div>
        {onEdit && (
          <button
            className="p-0.5 rounded hover:bg-gray-100 shrink-0"
            onClick={e => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6H3v6zm0 0l9-9a2.828 2.828 0 014 4l-9 9H3v-6z"/></svg>
          </button>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div 
        className={`flex justify-between items-center p-1 md:p-2 rounded-md border hover:bg-muted/50 transition-colors min-w-0 ${
          onSelect ? 'cursor-pointer' : ''
        } ${!isActive ? 'opacity-60 bg-gray-50/50' : ''}`}
        onClick={onSelect}
        style={{ minHeight: '40px' }}
      >
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {/* Visa liten bild på mobil och desktop */}
          <div className={`${!isActive ? 'grayscale opacity-70' : ''} shrink-0`}>
            {player.image ? (
              <img 
                src={player.image} 
                alt={player.name} 
                className="h-8 w-8 rounded-full object-cover"
                loading="lazy"
                crossOrigin="anonymous"
              />
            ) : (
              <UserCircle className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <div className={`font-medium text-xs md:text-sm flex items-center ${!isActive ? 'text-gray-500' : ''}`}>
              {player.name}
              {player.jerseyNumber && !isCoach && (
                <span className={`ml-1 text-[10px] md:text-xs px-1 py-0.5 rounded-full ${
                  !isActive ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-800'
                }`}>
                  #{player.jerseyNumber}
                </span>
              )}
            </div>
            {!isCoach && player.positions && (
              <div className={`text-[10px] md:text-xs ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
                {formatPositions(player.positions, true)}
              </div>
            )}
            <PlayerStatusIndicator player={player} size="sm" />
          </div>
        </div>
        {/* Actions */}
        {onEdit && (
          <button
            className="p-1 md:p-2 rounded hover:bg-gray-100"
            onClick={e => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6H3v6zm0 0l9-9a2.828 2.828 0 014 4l-9 9H3v-6z"/></svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <Card 
      className={`overflow-hidden ${onSelect ? 'cursor-pointer' : ''} hover:border-primary transition-colors ${
        isCoach ? 'border-amber-300' : ''
      } ${!isActive ? 'opacity-60 bg-gray-50/50' : ''}`}
      onClick={onSelect}
    >
      <div className="aspect-[3/2] bg-muted relative">
        <div className={!isActive ? 'grayscale opacity-70' : ''}>
          {player.image ? (
            <img 
              src={player.image} 
              alt={player.name} 
              className="w-full h-24 md:h-full object-cover"
              loading="lazy"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <UserCircle className="h-20 w-20 text-muted-foreground/50" />
            </div>
          )}
        </div>
        
        <div className="absolute top-2 right-2">
          {isCoach ? (
            <Badge className={`${
              !isActive ? 'bg-gray-400 hover:bg-gray-500' : 'bg-amber-500 hover:bg-amber-600'
            }`}>
              Tränare
            </Badge>
          ) : (
            <Badge className={`${
              !isActive ? 'bg-gray-400 hover:bg-gray-500' : getGradeColor(player.grade || '')
            }`}>
              Nivå {player.grade}
            </Badge>
          )}
        </div>
        
        {/* Show winrate badge for non-coaches */}
        {!isCoach && winRate > 0 && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className={`${
              !isActive 
                ? 'bg-gray-100 text-gray-500 border-gray-300' 
                : 'bg-white/90 text-primary border-primary'
            }`}>
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
        <h3 className={`font-semibold truncate ${!isActive ? 'text-gray-500' : ''}`}>
          {player.name}
          {player.jerseyNumber && !isCoach && (
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              !isActive ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-800'
            }`}>
              #{player.jerseyNumber}
            </span>
          )}
        </h3>
        {!isCoach && (
          <p className={`text-sm ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {player.positions && player.positions.length > 0
              ? formatPositions(player.positions, true)
              : 'Ingen position definierad'}
          </p>
        )}
        <div className="mt-1">
          <PlayerStatusIndicator player={player} size="sm" />
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-between">
        <span className={`text-xs ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
          {getActivityCount() === 0
            ? "Inga aktiviteter"
            : `${getActivityCount()} aktiviteter`}
        </span>
        
        {showStats && player.matches !== undefined && (
          <span className={`text-xs ${!isActive ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {player.matches} matcher
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
