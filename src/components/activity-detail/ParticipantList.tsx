import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { X, UserCircle } from "lucide-react";
import { PlayerList } from "../player-ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { sortPlayersByGrade } from "@/utils/gradeUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const isMobileDevice = useIsMobile();
  
  // We're now using the shared sortPlayersByGrade function
  // Note: This is actually redundant since the participants are already sorted
  // in the parent component (ParticipantsSection), but we keep it for consistency and safety
  const sortedParticipants = sortPlayersByGrade(participants);
  
  if (sortedParticipants.length === 0) {
    return (
      <div className="p-4 text-center border-2 border-dashed rounded-lg border-muted my-4">
        <p className="text-sm text-muted-foreground">Inga deltagare har lagts till än.</p>
      </div>
    );
  }

  // Custom player list for better mobile experience with avatars
  return (
    <div className="mb-4">
      <ScrollArea className={isMobileDevice ? "h-[calc(45vh-100px)]" : "h-[50vh]"}>
        <div className="pr-4 py-2">
          <div className="grid grid-cols-1 gap-2">
            {sortedParticipants.map((player) => (
              <div 
                key={player.id} 
                className="flex items-center justify-between p-2 border rounded-md"
                onClick={() => onPlayerSelect && onPlayerSelect(player.id)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={player.image} alt={player.name} />
                    <AvatarFallback className="bg-muted">
                      <UserCircle className="h-6 w-6 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{player.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePlayer(player.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
