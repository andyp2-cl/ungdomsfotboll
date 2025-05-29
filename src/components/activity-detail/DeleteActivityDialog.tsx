
import React from "react";
import { Activity } from "@/types/player";
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
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteActivityDialog({
  activity,
  isOpen,
  onClose,
  onConfirm
}: DeleteActivityDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ta bort aktivitet</AlertDialogTitle>
          <AlertDialogDescription>
            Är du säker på att du vill ta bort "{activity.name}"? Detta kan inte ångras.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Ta bort
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
