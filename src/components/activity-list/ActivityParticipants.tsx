
import React from "react";
import { Player } from "@/types/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { sortPlayersByGrade } from "@/utils/gradeUtils";

interface ActivityParticipantsProps {
  participants: Player[];
  onPlayerSelect?: (playerId: string) => void;
  totalCount?: number;
  maxDisplayed?: number;
  isMobile?: boolean;
  showAll?: boolean;
}

export function ActivityParticipants({
  participants,
  onPlayerSelect,
  totalCount = 0,
  maxDisplayed = 100,
  isMobile = false,
  showAll = true
}: ActivityParticipantsProps) {
  // Sort participants by grade
  const sortedParticipants = sortPlayersByGrade(participants);
  
  // Group participants by grade for better visual organization
  const participantsByGrade: Record<string, Player[]> = {};
  
  // Initialize groups for each grade level
  ['A', 'B', 'C', 'D', undefined].forEach(grade => {
    participantsByGrade[grade || 'undefined'] = [];
  });
  
  // Populate the groups
  sortedParticipants.forEach(player => {
    const grade = player.grade || 'undefined';
    participantsByGrade[grade].push(player);
  });
  
  if (!sortedParticipants.length) {
    return (
      <div className="text-xs text-muted-foreground">
        Inga deltagare
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {['A', 'B', 'C', 'D', 'undefined'].map(gradeKey => {
        const playersInGrade = participantsByGrade[gradeKey];
        
        // Skip rendering this grade group if it's empty
        if (playersInGrade.length === 0) return null;
        
        return (
          <div key={gradeKey} className="flex flex-wrap gap-1 items-center">
            {gradeKey !== 'undefined' && (
              <Badge variant="outline" className="mr-1">
                {gradeKey}
              </Badge>
            )}
            
            <TooltipProvider>
              {playersInGrade.map((player) => (
                <Tooltip key={player.id}>
                  <TooltipTrigger asChild>
                    <Avatar
                      className={`border-2 border-background cursor-pointer ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}
                      onClick={() => onPlayerSelect?.(player.id)}
                    >
                      <AvatarImage src={player.image} alt={player.name} />
                      <AvatarFallback className="text-xs bg-muted">
                        <UserRound className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div>
                      <p>{player.name}</p>
                      {player.grade && (
                        <Badge variant="outline" className="mt-1">{player.grade}</Badge>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        );
      })}
    </div>
  );
}
