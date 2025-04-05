
import React from "react";
import { Activity, Player } from "@/types/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityParticipantsProps {
  activity?: Activity;
  participants?: Player[];
  onPlayerSelect?: (playerId: string) => void;
  isMobile?: boolean;
}

export function ActivityParticipants({ 
  activity,
  participants = [],
  onPlayerSelect,
  isMobile = false
}: ActivityParticipantsProps) {
  // Make sure participants is an array before using slice
  const safeParticipants = Array.isArray(participants) ? participants : [];
  
  // Split participants into two rows for better visibility
  const participantsPerRow = isMobile ? 3 : 5;
  const firstRowParticipants = safeParticipants.slice(0, participantsPerRow);
  const secondRowParticipants = safeParticipants.slice(participantsPerRow, participantsPerRow * 2);
  const remainingCount = safeParticipants.length - (participantsPerRow * 2);

  if (safeParticipants.length === 0) {
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
          <AvatarImage src={player.image} alt={player.name} />
        ) : (
          <AvatarFallback className="text-[8px]">
            {player.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </AvatarFallback>
        )}
      </Avatar>
      <span className="truncate">{player.name}</span>
      {showComma && <span className="ml-0.5 text-muted-foreground">,</span>}
    </button>
  );
}
