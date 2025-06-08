
import React from "react";
import { Player, Activity } from "@/types/player";
import { EditPlayerDialog } from "@/components/dialogs/EditPlayerDialog";
import { EditActivityDialog } from "@/components/dialogs/EditActivityDialog";
import { AddPlayerDialog } from "@/components/dialogs/AddPlayerDialog";
import { AddActivityDialog } from "@/components/dialogs/AddActivityDialog";

interface DialogModalsProps {
  editingPlayer: Player | null;
  editingActivity: Activity | null;
  isAddPlayerOpen: boolean;
  isAddActivityOpen: boolean;
  onEditingPlayerChange: (player: Player | null) => void;
  onEditingActivityChange: (activity: Activity | null) => void;
  onAddPlayerOpenChange: (isOpen: boolean) => void;
  onAddActivityOpenChange: (isOpen: boolean) => void;
  onPlayerUpdate: (player: Player) => void;
  onActivityUpdate: (activity: Activity) => void;
  onAddPlayer: (player: Player) => void;
  onAddActivity: (activity: Activity) => void;
  players: Player[];
}

export function DialogModals({
  editingPlayer,
  editingActivity,
  isAddPlayerOpen,
  isAddActivityOpen,
  onEditingPlayerChange,
  onEditingActivityChange,
  onAddPlayerOpenChange,
  onAddActivityOpenChange,
  onPlayerUpdate,
  onActivityUpdate,
  onAddPlayer,
  onAddActivity,
  players
}: DialogModalsProps) {
  return (
    <>
      <EditPlayerDialog 
        player={editingPlayer}
        open={editingPlayer !== null}
        onOpenChange={(open) => !open && onEditingPlayerChange(null)}
        onPlayerUpdate={onPlayerUpdate}
      />

      <EditActivityDialog 
        activity={editingActivity}
        open={editingActivity !== null}
        onOpenChange={(open) => !open && onEditingActivityChange(null)}
        onActivityUpdate={onActivityUpdate}
      />

      <AddPlayerDialog 
        open={isAddPlayerOpen}
        onOpenChange={onAddPlayerOpenChange}
        onAddPlayer={onAddPlayer}
      />

      <AddActivityDialog 
        open={isAddActivityOpen}
        onOpenChange={onAddActivityOpenChange}
        onAddActivity={onAddActivity}
        players={players}
      />
    </>
  );
}
