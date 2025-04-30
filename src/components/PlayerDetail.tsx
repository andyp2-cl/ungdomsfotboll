
import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { PlayerHeader } from "./PlayerHeader";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { DeletePlayerDialog } from "./dialogs/DeletePlayerDialog";
import { ActivityList } from "./ActivityList";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

// Assuming the interface of the component includes these props
interface PlayerDetailProps {
  player: Player;
  activities: Activity[];
  onClose: () => void;
  onEdit: (player: Player) => void;
  onPlayerUpdate: (player: Player) => void;
  onDeletePlayer?: (playerId: string) => Promise<void>;
  allPlayers: Player[];
  onBulkUpdate?: (player: Player) => void;
  onActivitySelect?: (activity: Activity) => void;
}

export function PlayerDetail({
  player,
  activities,
  onClose,
  onEdit,
  onPlayerUpdate,
  onDeletePlayer,
  allPlayers,
  onBulkUpdate,
  onActivitySelect
}: PlayerDetailProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // This is a handler function to wrap the optional onDeletePlayer prop
  const handleDeleteConfirm = async (playerId: string) => {
    if (onDeletePlayer) {
      await onDeletePlayer(playerId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* PlayerHeader doesn't accept onClose prop, so we need to remove it */}
        <PlayerHeader player={player} onEdit={() => onEdit(player)} />
        
        {/* Add delete button */}
        {onDeletePlayer && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Ta bort
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Personlig information</h3>
          <div className="text-muted-foreground">
            <p><strong>Namn:</strong> {player.name}</p>
            <p><strong>Lag:</strong> {player.grade}</p>
            {player.jerseyNumber && <p><strong>Tröjnummer:</strong> {player.jerseyNumber}</p>}
            {player.positions && player.positions.length > 0 && (
              <p>
                <strong>Positioner:</strong>{" "}
                {player.positions.map((position, index) => (
                  <Badge key={index} variant="secondary">{position}</Badge>
                ))}
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Aktiviteter</h3>
          <ScrollArea className="h-[200px] w-full rounded-md border">
            {/* ActivityList expects 'players' array, not a single 'player' */}
            <ActivityList 
              activities={activities} 
              players={[player]} 
              onSelect={onActivitySelect}
            />
          </ScrollArea>
        </div>
      </div>
      
      {/* Add delete confirmation dialog */}
      <DeletePlayerDialog
        player={player}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleDeleteConfirm}
      />
    </div>
  );
}
