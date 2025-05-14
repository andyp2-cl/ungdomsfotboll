
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Player } from "@/types/player";
import { Trash2 } from "lucide-react";

interface DeletePlayerDialogProps {
  player: Player;
  onDelete: (playerId: string) => Promise<boolean>;
  onClose: () => void;
  trigger?: React.ReactNode;
  variant?: "button" | "icon";
}

export function DeletePlayerDialog({ 
  player, 
  onDelete, 
  onClose,
  trigger,
  variant = "button" 
}: DeletePlayerDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await onDelete(player.id);
      if (success) {
        setIsOpen(false);
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultTrigger = variant === "button" ? (
    <Button variant="destructive" size="sm">
      <Trash2 className="h-4 w-4 mr-2" />
      Ta bort
    </Button>
  ) : (
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Trash2 className="h-4 w-4" />
    </Button>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ta bort {player.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Är du säker på att du vill ta bort {player.name}? 
            Detta kommer ta bort all information om spelaren och kan inte ångras.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Tar bort..." : "Ta bort"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
