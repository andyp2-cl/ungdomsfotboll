
import { Player } from "@/types/player";
import { PlayerCard } from "@/components/PlayerCard";

interface PlayerGridViewProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
}

export function PlayerGridView({ players, onPlayerSelect, onPlayerEdit }: PlayerGridViewProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Inga spelare hittades</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {players.map(player => (
        <PlayerCard 
          key={player.id}
          player={player}
          onClick={() => onPlayerSelect(player)}
          onEdit={onPlayerEdit}
        />
      ))}
    </div>
  );
}
