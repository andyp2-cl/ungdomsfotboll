
import { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserMinus, UserPlus, Users, Trash2, UserCircle } from "lucide-react";
import { AddPlayersToActivity } from "@/components/AddPlayersToActivity";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  onPlayerSelect?: (playerId: string) => void;
}

export function ActivityParticipants({
  activity,
  players,
  updateActivity,
  onPlayerSelect
}: ActivityParticipantsProps) {
  const { toast } = useToast();
  const [isAddingPlayers, setIsAddingPlayers] = useState(false);
  
  const participatingPlayers = players.filter(
    (player) => activity.participants?.includes(player.id)
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
    
    const playerNames = playerIds.map(id => 
      players.find(p => p.id === id)?.name || "Spelare"
    ).join(", ");
    
    toast({
      title: "Spelare tillagda",
      description: `${playerNames} har lagts till i aktiviteten.`,
    });
  };

  const handleRemovePlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    const updatedParticipants = (activity.participants || []).filter(
      id => id !== playerId
    );
    
    const updatedActivity = {
      ...activity,
      participants: updatedParticipants
    };
    
    if (activity.kioskAssignedPlayerId === playerId) {
      updatedActivity.kioskAssignedPlayerId = undefined;
    }
    
    updateActivity(updatedActivity);
    
    toast({
      title: "Spelare borttagen",
      description: `${player.name} har tagits bort från aktiviteten.`,
    });
  };

  const handleClearAllParticipants = () => {
    const updatedActivity = {
      ...activity,
      participants: []
    };
    
    if (activity.kioskAssignedPlayerId) {
      updatedActivity.kioskAssignedPlayerId = undefined;
    }
    
    updateActivity(updatedActivity);
    
    toast({
      title: "Deltagarlista rensad",
      description: `Alla spelare har tagits bort från aktiviteten.`,
    });
  };

  return (
    <Accordion type="single" collapsible defaultValue="participants">
      <AccordionItem value="participants">
        <AccordionTrigger className="py-2">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            <span>Deltagare ({participatingPlayers.length})</span>
            {participatingPlayers.length === 0 && (
              <Badge variant="outline" className="ml-2">
                Inga deltagare
              </Badge>
            )}
            {participatingPlayers.length >= 12 && (
              <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                Maxantal
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {participatingPlayers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {participatingPlayers.map((player) => (
                <div 
                  key={player.id} 
                  className="p-2 border rounded-md flex justify-between items-center"
                >
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
                    onClick={() => onPlayerSelect && onPlayerSelect(player.id)}
                  >
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
                  </Button>
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
            {participatingPlayers.length < 12 && (
              <Button 
                variant="outline" 
                onClick={() => setIsAddingPlayers(!isAddingPlayers)}
                className="flex-grow"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isAddingPlayers ? "Avbryt" : "Lägg till spelare"}
              </Button>
            )}
            
            {participatingPlayers.length > 0 && (
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
                      Detta kommer ta bort alla {participatingPlayers.length} deltagare från aktiviteten. 
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
