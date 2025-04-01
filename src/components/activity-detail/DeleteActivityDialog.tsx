
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

interface DeleteActivityDialogProps {
  activityName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export function DeleteActivityDialog({
  activityName,
  isOpen,
  onOpenChange,
  onDelete
}: DeleteActivityDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Radera aktivitet</AlertDialogTitle>
          <AlertDialogDescription>
            Är du säker på att du vill radera "{activityName}"? 
            Denna åtgärd kan inte ångras och all information kopplad till aktiviteten kommer att försvinna.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDelete} 
            className="bg-red-500 hover:bg-red-700"
          >
            Radera
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
