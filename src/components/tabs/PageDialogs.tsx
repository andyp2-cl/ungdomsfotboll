
import { DialogModals } from "@/components/DialogModals";
import { Player, Activity } from "@/types/player";

interface PageDialogsProps {
  editingPlayer: Player | null;
  editingActivity: Activity | null;
  isAddPlayerOpen: boolean;
  isAddActivityOpen: boolean;
  setEditingPlayer: (player: Player | null) => void;
  setEditingActivity: (activity: Activity | null) => void;
  setIsAddPlayerOpen: (isOpen: boolean) => void;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  handlePlayerUpdate: (player: Player) => void;
  handleActivityUpdate: (activity: Activity) => void;
  handleAddPlayer: (player: Player) => void;
  handleAddActivity: (activity: Activity) => void;
}

export function PageDialogs({
  editingPlayer,
  editingActivity,
  isAddPlayerOpen,
  isAddActivityOpen,
  setEditingPlayer,
  setEditingActivity,
  setIsAddPlayerOpen,
  setIsAddActivityOpen,
  handlePlayerUpdate,
  handleActivityUpdate,
  handleAddPlayer,
  handleAddActivity
}: PageDialogsProps) {
  return (
    <DialogModals 
      editingPlayer={editingPlayer}
      editingActivity={editingActivity}
      isAddPlayerOpen={isAddPlayerOpen}
      isAddActivityOpen={isAddActivityOpen}
      onEditingPlayerChange={setEditingPlayer}
      onEditingActivityChange={setEditingActivity}
      onAddPlayerOpenChange={setIsAddPlayerOpen}
      onAddActivityOpenChange={setIsAddActivityOpen}
      onPlayerUpdate={handlePlayerUpdate}
      onActivityUpdate={handleActivityUpdate}
      onAddPlayer={handleAddPlayer}
      onAddActivity={handleAddActivity}
    />
  );
}
