
import React, { useState } from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  const displayCount = isMobile ? 8 : 5;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Snabbval</h4>
      <ScrollArea className={`${isMobile ? 'h-56' : 'h-32'} border rounded-md`}>
        <div className="p-2 space-y-1">
          {availablePlayers.slice(0, displayCount).map(player => (
            <Button
              key={player.id}
              variant="outline"
              size={isMobile ? "default" : "sm"}
              className="w-full justify-start"
              onClick={() => handleQuickSelect(player.id)}
              disabled={processingPlayer === player.id}
            >
              {processingPlayer === player.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {player.name}
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
