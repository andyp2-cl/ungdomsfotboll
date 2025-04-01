
import React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddPlayersButtonProps {
  selectedCount: number;
  onAddPlayers: () => void;
  disabled?: boolean;
}

export function AddPlayersButton({
  selectedCount,
  onAddPlayers,
  disabled = false
}: AddPlayersButtonProps) {
  return (
    <Button 
      onClick={onAddPlayers} 
      disabled={disabled || selectedCount === 0}
      className="w-full sm:w-auto"
    >
      <UserPlus className="h-4 w-4 mr-2" />
      Lägg till {selectedCount > 0 ? `(${selectedCount})` : ""}
    </Button>
  );
}
