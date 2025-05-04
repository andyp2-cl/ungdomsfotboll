import React from "react";
import { Activity, Player } from "@/types/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sortPlayersByGrade } from "@/utils/gradeUtils";

interface ActivityParticipantsProps {
  activity?: Activity;
  participants?: Player[];
  onPlayerSelect?: (playerId: string) => void;
  isMobile?: boolean;
  totalCount?: number;
  players?: Player[];
}

export function ActivityParticipants({ 
  activity,
  participants = [],
  onPlayerSelect,
  isMobile = false,
  totalCount,
  players = []
}: ActivityParticipantsProps) {
  // Make sure participants is an array before using slice
  const safeParticipants = Array.isArray(participants) ? participants : [];
  
  // Sort participants by grade (A, B, C, D) using the utility function
  const sortedParticipants = sortPlayersByGrade(safeParticipants);
  
  // Split participants into two rows for better visibility
  const participantsPerRow = isMobile ? 3 : 5;
  const firstRowParticipants = sortedParticipants.slice(0, participantsPerRow);
  const secondRowParticipants = sortedParticipants.slice(participantsPerRow, participantsPerRow * 2);
  const remainingCount = (totalCount !== undefined ? totalCount : sortedParticipants.length) - (participantsPerRow * 2);

  if (sortedParticipants.length === 0) {
    return (
      <div className="mt-1 pt-1 border-t border-dashed border-gray-200">
        <p className="text-xs text-muted-foreground font-medium">Inga deltagare ännu</p>
      </div>
    );
  }

  return (
    <div className="mt-1 pt-1 border-t border-dashed border-gray-200">
      <p className="text-xs text-muted-foreground font-medium mb-1">Deltagare:</p>
      
      {/* First row of participants */}
      <div className="flex flex-wrap items-center gap-1 mb-1">
        {firstRowParticipants.map((player, index) => (
          <ParticipantBadge 
            key={player.id} 
            player={player} 
            onPlayerSelect={onPlayerSelect} 
            showComma={index < firstRowParticipants.length - 1} 
          />
        ))}
      </div>
      
      {/* Second row of participants */}
      {secondRowParticipants.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {secondRowParticipants.map((player, index) => (
            <ParticipantBadge 
              key={player.id} 
              player={player} 
              onPlayerSelect={onPlayerSelect} 
              showComma={index < secondRowParticipants.length - 1} 
            />
          ))}
          {remainingCount > 0 && (
            <span className="text-xs text-muted-foreground ml-1">
              +{remainingCount} fler
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface ParticipantBadgeProps {
  player: Player;
  onPlayerSelect?: (playerId: string) => void;
  showComma: boolean;
}

function ParticipantBadge({ player, onPlayerSelect, showComma }: ParticipantBadgeProps) {
  // Add safe handling for player.name
  const displayName = player?.name || "Unknown";
  
  // Create a safe initial for the avatar fallback that doesn't rely on split
  const getInitials = (name: string): string => {
    if (!name) return "?";
    
    // Split the name and get initials
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).substring(0, 2);
    }
    return name.substring(0, 2);
  };

  const initials = getInitials(displayName);

  return (
    <button 
      className="inline-flex items-center text-sm hover:bg-muted px-1.5 py-0.5 rounded"
      onClick={(e) => {
        e.stopPropagation();
        onPlayerSelect && onPlayerSelect(player.id);
      }}
    >
      <Avatar className="h-4 w-4 mr-1 flex-shrink-0">
        {player.image ? (
          <AvatarImage src={player.image} alt={displayName} />
        ) : (
          <AvatarFallback className="text-[8px]">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
      <span className="truncate">{displayName}</span>
      {showComma && <span className="ml-0.5 text-muted-foreground">,</span>}
    </button>
  );
}
