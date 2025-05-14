
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
import { Player } from "@/types/player";

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
  
  const isCoach = player.positions?.includes('TRÄNARE');
  const title = isCoach ? "Ta bort tränare" : "Ta bort spelare";
  const description = isCoach 
    ? `Är du säker på att du vill ta bort tränaren ${player.name}?`
    : `Är du säker på att du vill ta bort spelaren ${player.name}?`;

  const handleDelete = async () => {
    await onConfirmDelete(player.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description} Denna åtgärd kan inte ångras.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Ta bort
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
