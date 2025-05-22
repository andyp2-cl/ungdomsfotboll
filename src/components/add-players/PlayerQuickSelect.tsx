
import React, { useState } from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, UserCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerQuickSelectProps {
  availablePlayers: Player[];
  onQuickSelect: (playerId: string) => void;
}

export function PlayerQuickSelect({
  availablePlayers,
  onQuickSelect
}: PlayerQuickSelectProps) {
  const [processingPlayer, setProcessingPlayer] = useState<string | null>(null);

  const handleQuickSelect = async (playerId: string) => {
    setProcessingPlayer(playerId);
    try {
      await onQuickSelect(playerId);
    } finally {
      setTimeout(() => setProcessingPlayer(null), 500); // Reset after a small delay for UX
    }
  };

  if (availablePlayers.length === 0) return null;

  // Get a small sample of players to display
  const quickSelectPlayers = availablePlayers.slice(0, 5);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Snabbval</h4>
      <ScrollArea className="h-36 border rounded-md">
        <div className="p-2 space-y-1.5">
          {quickSelectPlayers.map(player => (
            <Button
              key={player.id}
              variant="outline"
              size="sm"
              className="w-full justify-start items-center"
              onClick={() => handleQuickSelect(player.id)}
              disabled={processingPlayer === player.id}
            >
              {processingPlayer === player.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={player.image} alt={player.name} />
                  <AvatarFallback className="bg-muted">
                    <UserCircle className="h-4 w-4 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
              )}
              {player.name}
            </Button>
          ))}
          
          {availablePlayers.length > 5 && (
            <>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">
                +{availablePlayers.length - 5} fler spelare
              </p>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
