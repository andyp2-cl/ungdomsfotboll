
import React, { useState, useEffect } from "react";
import { Player, Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerMatchTabs } from "@/components/player-match-history/PlayerMatchTabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface PlayerDetailProps {
  player: Player;
  activities: Activity[];
  onClose: () => void;
  onEdit: (player: Player) => void;
  onPlayerUpdate: (player: Player) => void;
  onPlayerDelete?: (playerId: string) => Promise<void>;
  onBulkUpdate: (player: Player) => void;
  allPlayers: Player[];
  onActivitySelect?: (activity: Activity) => void;
}

export function PlayerDetail({
  player,
  activities,
  onClose,
  onEdit,
  onPlayerUpdate,
  onPlayerDelete,
  onBulkUpdate,
  allPlayers,
  onActivitySelect
}: PlayerDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Get activities where this player participated
  const playerActivities = activities.filter(activity => 
    activity.participants?.includes(player.id)
  );

  const handleDelete = async () => {
    if (!onPlayerDelete) return;
    
    setIsDeleting(true);
    try {
      await onPlayerDelete(player.id);
      onClose();
    } catch (error) {
      console.error("Error deleting player:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActivitySelect = (activity: Activity) => {
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
  };

  useEffect(() => {
    console.log("PlayerDetail: Player activities count:", playerActivities.length);
    console.log("PlayerDetail: All activities count:", activities.length);
  }, [playerActivities.length, activities.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onClose}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onEdit(player)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Redigera
          </Button>
          
          {onPlayerDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  Ta bort
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ta bort spelare</AlertDialogTitle>
                  <AlertDialogDescription>
                    Är du säker på att du vill ta bort {player.name}? Detta kan inte ångras.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Tar bort..." : "Ta bort"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <PlayerCard 
        player={player}
        onClick={() => {}}
      />

      <PlayerMatchTabs 
        player={player} 
        playerActivities={playerActivities}
        onActivitySelect={handleActivitySelect}
        allPlayers={allPlayers}
        allActivities={activities}
      />
    </div>
  );
}
