
import React from "react";
import { Player } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Redigera spelare</DialogTitle>
        </DialogHeader>
        {player && (
          <EditPlayerForm 
            player={player} 
            onSave={(updatedPlayer) => {
              onPlayerUpdate(updatedPlayer);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
