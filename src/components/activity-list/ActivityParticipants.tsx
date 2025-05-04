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
}

export function ActivityParticipants({
  participants,
  onPlayerSelect,
  totalCount = 0,
  maxDisplayed = 5,
  isMobile = false
}: ActivityParticipantsProps) {
  // Sort participants by grade
  const sortedParticipants = sortPlayersByGrade(participants);
  
  const displayParticipants = sortedParticipants.slice(0, maxDisplayed);
  const remainingCount = Math.max(0, totalCount - maxDisplayed);

  if (!sortedParticipants.length) {
    return (
      <div className="text-xs text-muted-foreground">
        Inga deltagare
      </div>
    );
  }

  return (
    <div className="flex items-center -space-x-2">
      <TooltipProvider>
        {displayParticipants.map((player) => (
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

        {remainingCount > 0 && (
          <Badge
            variant="secondary"
            className={`ml-2 ${isMobile ? 'text-xs h-6 w-6' : 'h-8 w-8'} rounded-full flex items-center justify-center`}
          >
            +{remainingCount}
          </Badge>
        )}
      </TooltipProvider>
    </div>
  );
}
