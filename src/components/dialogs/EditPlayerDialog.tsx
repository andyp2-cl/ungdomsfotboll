
import React from "react";
import { Player } from "@/types/player";
import { EditPlayerForm } from "@/components/EditPlayerForm";

interface EditPlayerDialogProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlayerUpdate: (player: Player) => void;
}

export function EditPlayerDialog({ 
  player, 
  open, 
  onOpenChange, 
  onPlayerUpdate 
}: EditPlayerDialogProps) {
  if (!player) return null;

  return (
    <EditPlayerForm
      isOpen={open}
      onClose={() => onOpenChange(false)}
      onSave={(updatedPlayer) => {
        onPlayerUpdate(updatedPlayer);
        onOpenChange(false);
      }}
      initialValues={player}
    />
  );
}
