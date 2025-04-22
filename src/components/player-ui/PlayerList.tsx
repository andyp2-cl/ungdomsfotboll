
import React from "react";
import { Player } from "@/types/player";
import { PlayerCard } from "./PlayerCard";

interface PlayerListProps {
  players: Player[];
  onPlayerSelect?: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
  emptyMessage?: string;
  compact?: boolean;
  showStats?: boolean;
  className?: string;
}

export function PlayerList({
  players,
  onPlayerSelect,
  onPlayerEdit,
  emptyMessage = "Inga spelare att visa",
  compact = false,
  showStats = false,
  className = ""
}: PlayerListProps) {
  if (players.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  
  if (compact) {
    return (
      <div className={`space-y-1 ${className}`}>
        {players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            onSelect={onPlayerSelect}
            onEdit={onPlayerEdit}
            compact={true}
            showStats={showStats}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {players.map(player => (
        <PlayerCard
          key={player.id}
          player={player}
          onSelect={onPlayerSelect}
          onEdit={onPlayerEdit}
          showStats={showStats}
        />
      ))}
    </div>
  );
}
