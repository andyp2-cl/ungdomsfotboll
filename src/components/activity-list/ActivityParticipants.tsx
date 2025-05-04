
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
  maxDisplayed = 100, // Changed from 5 to 100 to show all participants
  isMobile = false,
  showAll = true // New prop with default true to show all participants
}: ActivityParticipantsProps) {
  // Sort participants by grade
  const sortedParticipants = sortPlayersByGrade(participants);
  
  // If showAll is true, we display all participants, otherwise we use the maxDisplayed limit
  const displayParticipants = showAll ? sortedParticipants : sortedParticipants.slice(0, maxDisplayed);
  const remainingCount = showAll ? 0 : Math.max(0, totalCount - maxDisplayed);

  if (!sortedParticipants.length) {
    return (
      <div className="text-xs text-muted-foreground">
        Inga deltagare
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1 items-center">
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
