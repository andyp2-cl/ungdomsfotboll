
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface ParticipantActionButtonsProps {
  isAddingPlayers: boolean;
  setIsAddingPlayers: (isAdding: boolean) => void;
  participantCount: number;
  handleClearAllParticipants: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function ParticipantActionButtons({
  isAddingPlayers,
  setIsAddingPlayers,
  participantCount,
  handleClearAllParticipants,
  isOpen,
  setIsOpen
}: ParticipantActionButtonsProps) {
  const { isMobile } = useIsMobile();
  
  return (
    <div className={`flex flex-wrap gap-2 ${isAddingPlayers && isMobile ? 'hidden' : ''}`}>
      <Button 
        variant={isAddingPlayers ? "secondary" : "outline"} 
        onClick={() => setIsAddingPlayers(!isAddingPlayers)}
        className="flex-grow"
        size={isMobile ? "lg" : "default"}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {isAddingPlayers ? "Avbryt" : "Lägg till spelare"}
      </Button>
      
      {participantCount > 0 && (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <Button 
            variant="outline" 
            className="flex-grow text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={() => setIsOpen(true)}
            size={isMobile ? "lg" : "default"}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Rensa alla
          </Button>
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
                onClick={handleClearAllParticipants}
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
