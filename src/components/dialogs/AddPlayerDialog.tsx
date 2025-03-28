
import React from "react";
import { Player } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddPlayerForm } from "@/components/AddPlayerForm";

interface AddPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPlayer: (player: Player) => void;
}

export function AddPlayerDialog({ 
  open, 
  onOpenChange, 
  onAddPlayer 
}: AddPlayerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lägg till ny spelare</DialogTitle>
        </DialogHeader>
        <AddPlayerForm 
          onSave={(player) => {
            onAddPlayer(player);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
