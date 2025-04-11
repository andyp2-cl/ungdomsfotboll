
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ParticipantListProps {
  participants: Player[];
  onRemoveParticipant?: (playerId: string) => void;
  onPlayerSelect?: (playerId: string) => void;
  onRemovePlayer?: (playerId: string) => void; // Added this prop to support both naming conventions
  isMobile?: boolean;
}

// Map position codes to readable position names
const getPositionName = (position: string): string => {
  switch (position) {
    case 'MV': return 'Målvakt';
    case 'BACK': return 'Back';
    case 'MF': return 'Mittfältare';
    case 'ANF': return 'Anfallare';
    case 'TRÄNARE': return 'Tränare';
    default: return position;
  }
};

export function ParticipantList({ 
  participants, 
  onRemoveParticipant,
  onRemovePlayer,
  onPlayerSelect,
  isMobile = false
}: ParticipantListProps) {
  // Use onRemovePlayer as a fallback if onRemoveParticipant is not provided
  const handleRemove = (playerId: string) => {
    if (onRemoveParticipant) {
      onRemoveParticipant(playerId);
    } else if (onRemovePlayer) {
      onRemovePlayer(playerId);
    }
  };

  if (participants.length === 0) {
    return (
      <div className="text-center py-6 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">Inga deltagare tillagda ännu</p>
      </div>
    );
  }
  
  // Group players by position first (coaches at the top) then by grade
  const coachPlayers = participants.filter(player => 
    player.positions?.includes('TRÄNARE')
  );
  
  const nonCoachPlayers = participants.filter(player => 
    !player.positions?.includes('TRÄNARE')
  );
  
  // Group non-coach players by grade
  const playersByGrade = nonCoachPlayers.reduce((acc, player) => {
    const grade = player.grade || "Okänd";
    
    if (!acc[grade]) {
      acc[grade] = [];
    }
    
    acc[grade].push(player);
    return acc;
  }, {} as Record<string, Player[]>);
  
  // Sort grades alphabetically
  const sortedGrades = Object.keys(playersByGrade).sort();

  return (
    <div className="space-y-4">
      {/* Render coaches first */}
      {coachPlayers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Tränare</h4>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'}`}>
            {coachPlayers.map(player => (
              <div 
                key={player.id} 
                className={`flex justify-between items-center p-2 ${isMobile ? 'rounded-md border' : 'bg-muted/10 rounded-md'}`}
              >
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => onPlayerSelect?.(player.id)}
                >
                  <Avatar className={isMobile ? "h-6 w-6" : "h-8 w-8"}>
                    <AvatarImage src={player.image} alt={player.name} />
                    <AvatarFallback>
                      {player.name?.split(" ").map(n => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className={isMobile ? "text-sm font-medium" : "font-medium"}>{player.name}</span>
                    <Badge variant="outline" className={isMobile ? "text-xs py-0 px-1 mt-1" : "text-xs mt-1"}>
                      Tränare
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => handleRemove(player.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Then render players by grade */}
      {sortedGrades.map(grade => (
        <div key={grade} className="space-y-2">
          <h4 className="text-sm font-medium">Nivå {grade}</h4>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'}`}>
            {playersByGrade[grade].map(player => (
              <div 
                key={player.id} 
                className={`flex justify-between items-center p-2 ${isMobile ? 'rounded-md border' : 'bg-muted/10 rounded-md'}`}
              >
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => onPlayerSelect?.(player.id)}
                >
                  <Avatar className={isMobile ? "h-6 w-6" : "h-8 w-8"}>
                    <AvatarImage src={player.image} alt={player.name} />
                    <AvatarFallback>
                      {player.name?.split(" ").map(n => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className={isMobile ? "text-sm font-medium" : "font-medium"}>{player.name}</span>
                    {player.positions && player.positions.length > 0 && (
                      <div className="flex space-x-1 mt-1">
                        {Array.isArray(player.positions) ? (
                          player.positions
                            .filter(pos => pos !== 'TRÄNARE') // Filter out TRÄNARE
                            .slice(0, isMobile ? 1 : 2)
                            .map((position, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className={isMobile ? "text-xs py-0 px-1" : "text-xs"}
                              >
                                {getPositionName(position)}
                              </Badge>
                            ))
                        ) : (
                          <Badge 
                            variant="outline" 
                            className={isMobile ? "text-xs py-0 px-1" : "text-xs"}
                          >
                            {getPositionName(player.positions)}
                          </Badge>
                        )}
                        {Array.isArray(player.positions) && 
                         player.positions.filter(pos => pos !== 'TRÄNARE').length > (isMobile ? 1 : 2) && (
                          <Badge variant="outline" className="text-xs">
                            +{player.positions.filter(pos => pos !== 'TRÄNARE').length - (isMobile ? 1 : 2)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => handleRemove(player.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
