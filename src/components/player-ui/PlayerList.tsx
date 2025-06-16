import React from "react";
import { Player } from "@/types/player";
import { PlayerCard } from "./PlayerCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayerListProps {
  players: Player[];
  onPlayerSelect?: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
  onPlayerAction?: (player: Player) => React.ReactNode;
  emptyMessage?: string;
  compact?: boolean;
  showStats?: boolean;
  className?: string;
}

export function PlayerList({
  players,
  onPlayerSelect,
  onPlayerEdit,
  onPlayerAction,
  emptyMessage = "Inga spelare att visa",
  compact = false,
  showStats = false,
  className = ""
}: PlayerListProps) {
  const isMobile = useIsMobile();
  
  if (players.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  
  if (compact || isMobile) {
    return (
      <div className={`grid grid-cols-5 gap-1 ${className}`}>
        {players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            onSelect={onPlayerSelect ? () => onPlayerSelect(player) : undefined}
            onEdit={onPlayerEdit ? () => onPlayerEdit(player) : undefined}
            action={onPlayerAction ? onPlayerAction(player) : undefined}
            compact={true}
            showStats={showStats}
            isMobile={isMobile}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 ${className}`}>
      {players.map(player => (
        <PlayerCard
          key={player.id}
          player={player}
          onSelect={onPlayerSelect ? () => onPlayerSelect(player) : undefined}
          onEdit={onPlayerEdit ? () => onPlayerEdit(player) : undefined}
          action={onPlayerAction ? onPlayerAction(player) : undefined}
          showStats={showStats}
        />
      ))}
    </div>
  );
}
