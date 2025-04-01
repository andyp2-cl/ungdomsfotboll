
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2 } from "lucide-react";
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

interface ParticipantActionsProps {
  participantCount: number;
  isAddingPlayers: boolean;
  setIsAddingPlayers: (isAdding: boolean) => void;
  onClearAllParticipants: () => void;
}

export function ParticipantActions({
  participantCount,
  isAddingPlayers,
  setIsAddingPlayers,
  onClearAllParticipants
}: ParticipantActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {participantCount < 12 && (
        <Button 
          variant="outline" 
          onClick={() => setIsAddingPlayers(!isAddingPlayers)}
          className="flex-grow"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {isAddingPlayers ? "Avbryt" : "Lägg till spelare"}
        </Button>
      )}
      
      {participantCount > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-grow text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Rensa alla
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Är du säker?</AlertDialogTitle>
              <AlertDialogDescription>
                Detta kommer ta bort alla {participantCount} deltagare från aktiviteten. 
                Denna åtgärd kan inte ångras.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onClearAllParticipants}
                className="bg-red-500 hover:bg-red-700"
              >
                Ta bort alla
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
