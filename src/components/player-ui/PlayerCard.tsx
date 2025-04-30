
import React from "react";
import { Player } from "@/types/player";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  onSelect?: () => void;
  onEdit?: () => void;
  action?: React.ReactNode;
  compact?: boolean;
  showStats?: boolean;
}

export function PlayerCard({ 
  player, 
  onSelect, 
  onEdit, 
  action, 
  compact = false,
  showStats = false 
}: PlayerCardProps) {
  // Get real activity count that excludes kiosk duty assignments
  const getActivityCount = () => {
    if (!player.activities) return 0;
    return player.activities.length;
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

  const formatPosition = (position: string) => {
    if (position === 'TRÄNARE') return 'Tränare';
    
    let formattedPosition = position
      .replace('MV', 'Målvakt')
      .replace('BACK', 'Back')
      .replace('MF', 'Mittfält')
      .replace('ANF', 'Anfall');
    
    return formattedPosition;
  };

  const isCoach = player.positions?.includes('TRÄNARE');

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`Failed to load image for player: ${player.name}`);
    e.currentTarget.src = ''; // Clear src to show fallback
    e.currentTarget.style.display = 'none'; // Hide the img element
    e.currentTarget.parentElement!.querySelector('.fallback-icon')!.style.display = 'flex';
  };

  // Check if image exists and is valid
  const hasValidImage = player.image && typeof player.image === 'string' && player.image.length > 10;

  if (compact) {
    return (
      <div 
        className={`flex justify-between items-center p-2 rounded-md border hover:bg-muted/50 transition-colors ${onSelect ? 'cursor-pointer' : ''}`}
        onClick={onSelect}
      >
        <div className="flex items-center gap-2">
          {hasValidImage ? (
            <div className="relative h-8 w-8 rounded-full overflow-hidden">
              <img 
                src={player.image} 
                alt={player.name} 
                className="h-8 w-8 rounded-full object-cover"
                loading="lazy"
                onError={handleImageError}
              />
              <div className="fallback-icon hidden h-full w-full items-center justify-center">
                <UserCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          ) : (
            <UserCircle className="h-8 w-8 text-muted-foreground" />
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
                {player.positions
                  .filter(pos => pos !== 'TRÄNARE')
                  .map(formatPosition)
                  .join(', ')}
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
      <div className="aspect-[4/3] bg-muted relative">
        {hasValidImage ? (
          <div className="relative w-full h-full">
            <img 
              src={player.image} 
              alt={player.name} 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={handleImageError}
            />
            <div className="fallback-icon hidden absolute inset-0 w-full h-full items-center justify-center bg-muted">
              <UserCircle className="h-20 w-20 text-muted-foreground/50" />
            </div>
          </div>
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
        
        {action && (
          <div className="absolute top-2 left-2" onClick={e => e.stopPropagation()}>
            {action}
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
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
              ? player.positions
                  .filter(pos => pos !== 'TRÄNARE')
                  .map(formatPosition)
                  .join(', ')
              : 'Ingen position definierad'}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
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
