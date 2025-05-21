
import React, { useState } from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerQuickSelectProps {
  availablePlayers: Player[];
  onQuickSelect: (playerId: string) => void;
  isMobile?: boolean;
}

export function PlayerQuickSelect({
  availablePlayers,
  onQuickSelect,
  isMobile = false
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

  // Show more players in the quick select list on mobile
  const displayCount = isMobile ? 12 : 5;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Snabbval</h4>
      <ScrollArea className={`${isMobile ? 'h-64' : 'h-32'} border rounded-md`}>
        <div className="p-2 space-y-1">
          {availablePlayers.slice(0, displayCount).map(player => (
            <Button
              key={player.id}
              variant="outline"
              size={isMobile ? "default" : "sm"}
              className="w-full justify-start py-3"
              onClick={() => handleQuickSelect(player.id)}
              disabled={processingPlayer === player.id}
            >
              {processingPlayer === player.id ? (
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              ) : (
                <>
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={player.image} alt={player.name} />
                    <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </>
              )}
              <span className={isMobile ? "text-base" : ""}>{player.name}</span>
            </Button>
          ))}
          
          {availablePlayers.length > displayCount && (
            <>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">
                +{availablePlayers.length - displayCount} fler spelare
              </p>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
