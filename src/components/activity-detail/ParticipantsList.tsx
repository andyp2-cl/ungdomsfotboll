
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCircle, UserMinus } from "lucide-react";
import { sortPlayersByGrade } from "@/utils/gradeUtils";

interface ParticipantsListProps {
  participants: Player[];
  onPlayerSelect?: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
}

export function ParticipantsList({
  participants,
  onPlayerSelect,
  onRemovePlayer
}: ParticipantsListProps) {
  // Using the shared utility function for consistent sorting
  const sortedParticipants = sortPlayersByGrade(participants);

  if (sortedParticipants.length === 0) {
    return <p className="text-muted-foreground mb-4">Inga deltagare tillagda än</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
      {sortedParticipants.map((player) => (
        <div 
          key={player.id} 
          className="p-2 border rounded-md flex justify-between items-center"
        >
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
            onClick={() => onPlayerSelect && onPlayerSelect(player.id)}
          >
            {player.image ? (
              <img 
                src={player.image} 
                alt={player.name} 
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="h-6 w-6 text-gray-400" />
            )}
            <span className="text-foreground">{player.name}</span>
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {player.positions?.includes("TRÄNARE") ? 'Tränare' : `Nivå ${player.grade}`}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onRemovePlayer(player.id)}
              title="Ta bort spelare"
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
