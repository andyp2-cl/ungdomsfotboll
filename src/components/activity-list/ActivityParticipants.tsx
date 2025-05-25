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
  maxShow?: number;
  isMobile?: boolean;
  showAll?: boolean;
}

export function ActivityParticipants({
  participants,
  onPlayerSelect,
  totalCount = 0,
  maxDisplayed = 100,
  maxShow = 100,
  isMobile = false,
  showAll = true
}: ActivityParticipantsProps) {
  // Sort participants by grade
  const sortedParticipants = sortPlayersByGrade(participants);
  
  // Show ALL participants - remove the limiting
  const displayedParticipants = sortedParticipants;
  
  // Group participants by grade for better visual organization
  const participantsByGrade: Record<string, Player[]> = {};
  
  // Initialize groups for each grade level
  ['A', 'B', 'C', 'D', undefined].forEach(grade => {
    participantsByGrade[grade || 'undefined'] = [];
  });
  
  // Populate the groups
  displayedParticipants.forEach(player => {
    const grade = player.grade || 'undefined';
    participantsByGrade[grade].push(player);
  });
  
  // Function to get first name only
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  // Handle click on a player
  const handlePlayerClick = (playerId: string, e: React.MouseEvent) => {
    // Stop propagation to prevent the activity selection from triggering
    e.stopPropagation();
    
    console.log("ActivityParticipants: Player clicked:", playerId);
    if (onPlayerSelect) {
      onPlayerSelect(playerId);
    }
  };

  if (!displayedParticipants.length) {
    return (
      <div className="text-xs text-muted-foreground">
        Inga deltagare
      </div>
    );
  }

  // Reduced avatar sizes by 25%
  const avatarSize = isMobile ? 'h-12 w-12' : 'h-10 w-10';
  const iconSize = isMobile ? 'h-6 w-6' : 'h-5 w-5';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {['A', 'B', 'C', 'D', 'undefined'].map(gradeKey => {
        const playersInGrade = participantsByGrade[gradeKey];
        
        // Skip rendering this grade group if it's empty
        if (playersInGrade.length === 0) return null;
        
        return (
          <div key={gradeKey} className="flex flex-col gap-1">
            {gradeKey !== 'undefined' && (
              <Badge variant="outline" className="self-start mr-1 mb-1">
                {gradeKey}
              </Badge>
            )}
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 w-full">
              {playersInGrade.map((player) => (
                <div 
                  key={player.id}
                  data-player-item="true"
                  className={`flex flex-col items-center gap-0.5 border rounded-md p-1.5 bg-background ${onPlayerSelect ? 'cursor-pointer hover:bg-accent' : ''}`}
                  onClick={(e) => onPlayerSelect && handlePlayerClick(player.id, e)}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className={`border-2 border-background ${avatarSize}`}>
                          <AvatarImage src={player.image} alt={player.name} />
                          <AvatarFallback className="bg-muted">
                            <UserRound className={iconSize} />
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
                  </TooltipProvider>
                  <span className={`${isMobile ? 'text-xs' : 'text-xs'} overflow-hidden text-ellipsis whitespace-nowrap text-center w-full`}>
                    {getFirstName(player.name)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
