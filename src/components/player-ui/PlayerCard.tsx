
import React from "react";
import { Player } from "@/types/player";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, User } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  onSelect?: (player: Player) => void;
  onEdit?: (player: Player) => void;
  compact?: boolean;
  showStats?: boolean;
}

export function PlayerCard({
  player,
  onSelect,
  onEdit,
  compact = false,
  showStats = false
}: PlayerCardProps) {
  // Get player initials for avatar fallback
  const getInitials = () => {
    const nameParts = player.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    }
    return player.name.substring(0, 2).toUpperCase();
  };
  
  // Determine if player is a coach
  const isCoach = player.positions?.includes('TRÄNARE');
  
  // Get grade color
  const getGradeColor = () => {
    switch (player.grade) {
      case 'A': return "bg-red-500";
      case 'B': return "bg-blue-500";
      case 'C': return "bg-green-500";
      case 'D': return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };
  
  if (compact) {
    return (
      <div 
        className="flex items-center p-2 gap-2 hover:bg-accent rounded-md cursor-pointer"
        onClick={() => onSelect?.(player)}
      >
        <Avatar className="h-8 w-8">
          {player.image ? (
            <AvatarImage src={player.image} alt={player.name} />
          ) : (
            <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-grow">
          <p className="text-sm font-medium">{player.name}</p>
          <div className="flex gap-1 items-center">
            {!isCoach && player.grade && (
              <span className={`${getGradeColor()} w-3 h-3 rounded-full`} />
            )}
            <p className="text-xs text-muted-foreground">
              {isCoach ? "Tränare" : player.positions?.filter(p => p !== 'TRÄNARE').join(", ")}
            </p>
          </div>
        </div>
        
        {onEdit && (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(player);
            }}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              {player.image ? (
                <AvatarImage src={player.image} alt={player.name} />
              ) : (
                <AvatarFallback>{getInitials()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-medium leading-none">{player.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isCoach ? "Tränare" : player.positions?.filter(p => p !== 'TRÄNARE').join(", ")}
              </p>
            </div>
          </div>
          
          {!isCoach && player.grade && (
            <Badge 
              variant="secondary"
              className={`${getGradeColor()} text-white`}
            >
              {player.grade}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      {showStats && (
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted rounded-md p-2 text-center">
              <p className="text-xs text-muted-foreground">Aktiviteter</p>
              <p className="font-medium">{player.activities?.length || 0}</p>
            </div>
            <div className="bg-muted rounded-md p-2 text-center">
              <p className="text-xs text-muted-foreground">Matcher</p>
              <p className="font-medium">{player.matches || 0}</p>
            </div>
          </div>
        </CardContent>
      )}
      
      <CardFooter className="pt-2">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onSelect?.(player)}
          >
            <User className="h-3.5 w-3.5 mr-1.5" />
            Visa
          </Button>
          
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={() => onEdit(player)}
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Redigera
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
