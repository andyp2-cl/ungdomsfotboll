
import React from "react";
import { Player } from "@/types/player";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeletePlayerDialogProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (playerId: string) => Promise<void>;
}

export function DeletePlayerDialog({
  player,
  open,
  onOpenChange,
  onConfirmDelete
}: DeletePlayerDialogProps) {
  if (!player) return null;

  const handleConfirm = async () => {
    await onConfirmDelete(player.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ta bort spelare</AlertDialogTitle>
          <AlertDialogDescription>
            Är du säker på att du vill ta bort {player.name}? Denna åtgärd kan inte ångras, 
            och all information om denna spelare kommer att försvinna från systemet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground">
            Ta bort
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
