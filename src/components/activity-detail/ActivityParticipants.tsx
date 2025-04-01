
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCircle, UserPlus, UserMinus, Trash2 } from "lucide-react";
import { AddPlayersToActivity } from "@/components/AddPlayersToActivity";
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

interface ActivityParticipantsProps {
  activity: Activity;
  players: Player[];
  updateActivity: (updatedActivity: Activity) => void;
}

export function ActivityParticipants({ activity, players, updateActivity }: ActivityParticipantsProps) {
  const [isAddingPlayers, setIsAddingPlayers] = useState(false);
  
  // Find participants
  const participantPlayers = players.filter(player => 
    activity.participants?.includes(player.id)
  );

  const handleAddPlayers = (playerIds: string[]) => {
    const updatedParticipants = [
      ...(activity.participants || []),
      ...playerIds
    ];
    
    const updatedActivity = {
      ...activity,
      participants: updatedParticipants
    };
    
    updateActivity(updatedActivity);
  };

  const handleRemovePlayer = (playerId: string) => {
    const updatedParticipants = (activity.participants || []).filter(
      id => id !== playerId
    );
    
    const updatedActivity = {
      ...activity,
      participants: updatedParticipants
    };
    
    // If this player was assigned to kiosk, remove the assignment
    if (activity.kioskAssignedPlayerId === playerId) {
      updatedActivity.kioskAssignedPlayerId = undefined;
    }
    
    updateActivity(updatedActivity);
  };

  const handleClearAllParticipants = () => {
    const updatedActivity = {
      ...activity,
      participants: [],
      // Also clear kiosk assignment
      kioskAssignedPlayerId: undefined
    };
    
    updateActivity(updatedActivity);
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Deltagare ({participantPlayers.length})</h3>
      
      {participantPlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {participantPlayers.map((player) => (
            <div 
              key={player.id} 
              className="p-2 border rounded-md flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                {player.image ? (
                  <img 
                    src={player.image} 
                    alt={player.name} 
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-6 w-6 text-gray-400" />
                )}
                <span className="text-foreground">{player.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {player.positions?.includes("TRÄNARE") ? 'Tränare' : `Nivå ${player.grade}`}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemovePlayer(player.id)}
                  title="Ta bort spelare"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground mb-4">Inga deltagare tillagda än</p>
      )}

      <div className="flex flex-wrap gap-2">
        {participantPlayers.length < 12 && (
          <Button 
            variant="outline" 
            onClick={() => setIsAddingPlayers(!isAddingPlayers)}
            className="flex-grow"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isAddingPlayers ? "Avbryt" : "Lägg till spelare"}
          </Button>
        )}
        
        {participantPlayers.length > 0 && (
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
                  Detta kommer ta bort alla {participantPlayers.length} deltagare från aktiviteten. 
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

      {isAddingPlayers && (
        <AddPlayersToActivity 
          activity={activity}
          players={players}
          onAddPlayers={handleAddPlayers}
          currentParticipantIds={activity.participants || []}
        />
      )}
    </div>
  );
}
