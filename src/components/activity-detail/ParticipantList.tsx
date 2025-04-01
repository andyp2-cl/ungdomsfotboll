
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ParticipantListProps {
  participants: Player[];
  onRemoveParticipant: (playerId: string) => void;
  onPlayerSelect?: (playerId: string) => void;
  isMobile?: boolean;
}

export function ParticipantList({ 
  participants, 
  onRemoveParticipant,
  onPlayerSelect,
  isMobile = false
}: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-6 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">Inga deltagare tillagda ännu</p>
      </div>
    );
  }
  
  // Group players by grade
  const playersByGrade = participants.reduce((acc, player) => {
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
      {sortedGrades.map(grade => (
        <div key={grade} className="space-y-2">
          <h4 className="text-sm font-medium">{grade}</h4>
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
                          player.positions.slice(0, isMobile ? 1 : 2).map((position, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className={isMobile ? "text-xs py-0 px-1" : "text-xs"}
                            >
                              {position}
                            </Badge>
                          ))
                        ) : (
                          <Badge 
                            variant="outline" 
                            className={isMobile ? "text-xs py-0 px-1" : "text-xs"}
                          >
                            {player.positions}
                          </Badge>
                        )}
                        {Array.isArray(player.positions) && player.positions.length > (isMobile ? 1 : 2) && (
                          <Badge variant="outline" className="text-xs">+{player.positions.length - (isMobile ? 1 : 2)}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => onRemoveParticipant(player.id)}
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
