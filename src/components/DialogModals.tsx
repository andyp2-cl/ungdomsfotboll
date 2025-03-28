
import React from "react";
import { Player, Activity } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditPlayerForm } from "@/components/EditPlayerForm";
import { EditActivityForm } from "@/components/EditActivityForm";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { AddActivityForm } from "@/components/AddActivityForm";

interface DialogModalsProps {
  editingPlayer: Player | null;
  editingActivity: Activity | null;
  isAddPlayerOpen: boolean;
  isAddActivityOpen: boolean;
  onEditingPlayerChange: (player: Player | null) => void;
  onEditingActivityChange: (activity: Activity | null) => void;
  onAddPlayerOpenChange: (isOpen: boolean) => void;
  onAddActivityOpenChange: (isOpen: boolean) => void;
  onPlayerUpdate: (player: Player) => void;
  onActivityUpdate: (activity: Activity) => void;
  onAddPlayer: (player: Player) => void;
  onAddActivity: (activity: Activity) => void;
}

export function DialogModals({
  editingPlayer,
  editingActivity,
  isAddPlayerOpen,
  isAddActivityOpen,
  onEditingPlayerChange,
  onEditingActivityChange,
  onAddPlayerOpenChange,
  onAddActivityOpenChange,
  onPlayerUpdate,
  onActivityUpdate,
  onAddPlayer,
  onAddActivity
}: DialogModalsProps) {
  return (
    <>
      <Dialog open={editingPlayer !== null} onOpenChange={(open) => !open && onEditingPlayerChange(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redigera spelare</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <EditPlayerForm 
              player={editingPlayer} 
              onSave={(updatedPlayer) => {
                onPlayerUpdate(updatedPlayer);
                onEditingPlayerChange(null);
              }}
              onCancel={() => onEditingPlayerChange(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editingActivity !== null} onOpenChange={(open) => !open && onEditingActivityChange(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redigera aktivitet</DialogTitle>
          </DialogHeader>
          {editingActivity && (
            <EditActivityForm 
              activity={editingActivity} 
              onSave={(updatedActivity) => {
                onActivityUpdate(updatedActivity);
                onEditingActivityChange(null);
              }}
              onCancel={() => onEditingActivityChange(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddPlayerOpen} onOpenChange={onAddPlayerOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lägg till ny spelare</DialogTitle>
          </DialogHeader>
          <AddPlayerForm 
            onSave={onAddPlayer}
            onCancel={() => onAddPlayerOpenChange(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddActivityOpen} onOpenChange={onAddActivityOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lägg till ny aktivitet</DialogTitle>
          </DialogHeader>
          <AddActivityForm 
            onSave={onAddActivity}
            onCancel={() => onAddActivityOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
