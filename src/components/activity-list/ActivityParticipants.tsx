
import React, { useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  // Make sure participants is an array before processing
  const safeParticipants = Array.isArray(participants) ? participants : [];
  
  // Group players by grade
  const participantsByGrade = useMemo(() => {
    const groups: Record<string, Player[]> = {
      A: [],
      B: [],
      C: [],
      D: []
    };
    
    safeParticipants.forEach(player => {
      if (player.grade && groups[player.grade]) {
        groups[player.grade].push(player);
      } else {
        // If grade is undefined or not A/B/C/D, add to the end
        if (!groups.other) {
          groups.other = [];
        }
        groups.other.push(player);
      }
    });
    
    // Filter out empty grade groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, players]) => players.length > 0)
    );
  }, [safeParticipants]);
  
  // Get all grade keys that have players
  const activeGrades = Object.keys(participantsByGrade);
  
  if (safeParticipants.length === 0) {
    return (
      <div className="mt-1 pt-1 border-t border-dashed border-gray-200">
        <p className="text-xs text-muted-foreground font-medium">Inga deltagare ännu</p>
      </div>
    );
  }

  const totalShown = Object.values(participantsByGrade)
    .flat()
    .length;
  
  const remainingCount = (totalCount !== undefined ? totalCount : safeParticipants.length) - totalShown;

  return (
    <div className="mt-1 pt-1 border-t border-dashed border-gray-200">
      <p className="text-xs text-muted-foreground font-medium mb-1">Deltagare:</p>
      
      {/* Render players grouped by grade */}
      {activeGrades.map((grade) => (
        <div key={grade} className="flex flex-wrap items-center gap-1 mb-1">
          {grade !== "other" && (
            <span className="text-xs font-medium bg-gray-100 px-1 py-0.5 rounded">
              {grade}:
            </span>
          )}
          
          {participantsByGrade[grade].map((player, index) => (
            <ParticipantBadge 
              key={player.id} 
              player={player} 
              onPlayerSelect={onPlayerSelect} 
              showComma={index < participantsByGrade[grade].length - 1} 
            />
          ))}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <span className="text-xs text-muted-foreground ml-1">
          +{remainingCount} fler
        </span>
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
