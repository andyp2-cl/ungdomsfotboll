
import { Player } from "@/types/player";
import { PlayerCard } from "@/components/player-ui";
import { PlayerGridView } from "./PlayerGridView";
import { DeletePlayerDialog } from "@/components/dialogs/DeletePlayerDialog";

interface PlayerListProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
  onPlayerDelete?: (playerId: string) => Promise<boolean>;
  view?: "grid" | "list";
}

export function PlayerList({
  players,
  onPlayerSelect,
  onPlayerEdit,
  onPlayerDelete,
  view = "grid"
}: PlayerListProps) {
  if (view === "list") {
    return <PlayerGridView players={players} onPlayerSelect={onPlayerSelect} onPlayerEdit={onPlayerEdit} />;
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Inga spelare hittades
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {players.map((player) => (
        <PlayerCard 
          key={player.id} 
          player={player} 
          onClick={() => onPlayerSelect(player)}
          actions={
            onPlayerDelete ? (
              <DeletePlayerDialog
                player={player}
                onDelete={onPlayerDelete}
                onClose={() => {}}
                variant="icon"
              />
            ) : undefined
          }
        />
      ))}
    </div>
  );
}
