
import React from "react";
import { Player } from "@/types/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sortPlayersByGrade } from "@/utils/gradeUtils";

interface ParticipantListProps {
  participants: Player[];
  onPlayerSelect?: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
  isMobile?: boolean;
}

export function ParticipantList({
  participants,
  onPlayerSelect,
  onRemovePlayer,
  isMobile = false
}: ParticipantListProps) {
  // Sort participants by grade (A, B, C, D)
  const sortedParticipants = sortPlayersByGrade(participants);
  
  // Group participants by grade for better organization
  const participantsByGrade: Record<string, Player[]> = {};
  
  // Initialize groups
  ['A', 'B', 'C', 'D', undefined].forEach(grade => {
    participantsByGrade[grade || 'undefined'] = [];
  });
  
  // Populate groups
  sortedParticipants.forEach(player => {
    const grade = player.grade || 'undefined';
    participantsByGrade[grade].push(player);
  });
  
  if (participants.length === 0) {
    return (
      <div className="text-muted-foreground text-sm py-4 text-center border rounded-md">
        Inga deltagare tillagda ännu
      </div>
    );
  }

  // Make the height of the scroll area appropriate for the device
  const maxHeight = isMobile ? '200px' : '400px';
  
  return (
    <ScrollArea className={`pr-4 ${participants.length > 8 ? `max-h-[${maxHeight}]` : ''}`}>
      <div className="space-y-4 mb-20">
        {['A', 'B', 'C', 'D', 'undefined'].map(gradeKey => {
          const playersInGrade = participantsByGrade[gradeKey];
          if (playersInGrade.length === 0) return null;
          
          return (
            <div key={gradeKey} className="space-y-2">
              {gradeKey !== 'undefined' && (
                <Badge variant="outline" className="self-start mb-1">
                  {gradeKey}
                </Badge>
              )}
              
              <div className="space-y-2">
                {playersInGrade.map((player) => (
                  <div 
                    key={player.id}
                    className={`flex justify-between items-center p-2 border rounded-md ${isMobile ? 'px-3 py-3' : ''}`}
                  >
                    <div 
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => onPlayerSelect && onPlayerSelect(player.id)}
                    >
                      <Avatar className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8'}`}>
                        <AvatarImage src={player.image} alt={player.name} />
                        <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className={`${isMobile ? 'text-base' : 'text-sm'}`}>{player.name}</span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onRemovePlayer(player.id)}
                    >
                      <X className={`${isMobile ? 'h-6 w-6' : 'h-4 w-4'}`} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
