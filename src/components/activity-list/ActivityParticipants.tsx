
import React from "react";
import { Player } from "@/types/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getPlayerInitials } from "@/components/PlayerCard";
import { getGradeColor } from "@/utils/gradeUtils";

interface ActivityParticipantsProps {
  participants: Player[];
  onPlayerSelect?: (playerId: string) => void;
  totalCount?: number;
  limit?: number;
  isMobile?: boolean;
  showAll?: boolean;
  isHistorical?: boolean;
}

export function ActivityParticipants({
  participants,
  onPlayerSelect,
  totalCount = 0,
  limit = 5,
  isMobile = false,
  showAll = false,
  isHistorical = false
}: ActivityParticipantsProps) {
  const displayParticipants = showAll ? participants : participants.slice(0, limit);
  const remainingCount = totalCount - limit;
  
  const avatarSize = isMobile ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm";
  
  if (participants.length === 0) {
    return <div className="text-sm text-muted-foreground">Inga deltagare</div>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {displayParticipants.map((player) => {
        const borderColor = getGradeColor(player.grade);
        
        // Handle player click, respecting isHistorical flag
        const handleClick = () => {
          if (isHistorical) {
            // Do nothing for historical activities
            console.log("Ignoring player click in historical activity");
            return;
          }
          
          if (onPlayerSelect) {
            onPlayerSelect(player.id);
          }
        };
        
        return (
          <Avatar 
            key={player.id} 
            className={`${avatarSize} border-2 cursor-pointer hover:scale-110 transition-transform ${borderColor}`}
            onClick={handleClick}
          >
            {player.image ? (
              <AvatarImage src={player.image} alt={player.name} />
            ) : (
              <AvatarFallback className={avatarSize}>
                {getPlayerInitials(player.name)}
              </AvatarFallback>
            )}
          </Avatar>
        );
      })}
      
      {!showAll && remainingCount > 0 && (
        <Badge variant="secondary" className={`${isMobile ? 'text-xs px-2 h-6' : ''} flex items-center justify-center`}>
          +{remainingCount} fler
        </Badge>
      )}
    </div>
  );
}
