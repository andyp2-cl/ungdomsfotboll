
import { useState, useEffect } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X, Users, MapPin, Clock, Edit, UserPlus, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddPlayersToActivity } from "./AddPlayersToActivity";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { UserCircle, Check } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface ActivityDetailProps {
  activity: Activity;
  players: Player[];
  onClose: () => void;
  onEdit?: (activity: Activity) => void;
  onActivityUpdate?: (updatedActivity: Activity) => void;
}

export function ActivityDetail({ 
  activity, 
  players, 
  onClose, 
  onEdit, 
  onActivityUpdate
}: ActivityDetailProps) {
  const { toast } = useToast();
  const [currentActivity, setCurrentActivity] = useState<Activity>(activity);
  const [isAddingPlayers, setIsAddingPlayers] = useState(false);
  
  // Check if activity is eligible for kiosk duty (home match at Österås IP)
  const isKioskEligible = () => {
    if (!currentActivity.location) return false;
    
    const isAtÖsteråsIP = currentActivity.location.name.includes('Österås IP');
    const isHomeMatch = currentActivity.name.toLowerCase().startsWith('hässleholms if');
    
    return isAtÖsteråsIP && isHomeMatch;
  };
  
  // Find all players participating in this activity
  const participatingPlayers = players.filter(
    (player) => currentActivity.participants?.includes(player.id)
  );

  // Get assigned kiosk player name
  const getKioskPlayerName = () => {
    if (!currentActivity.kioskAssignedPlayerId) return "Ej tilldelad";
    const player = players.find(p => p.id === currentActivity.kioskAssignedPlayerId);
    return player ? player.name : "Okänd spelare";
  };

  // Handle assigning a player to kiosk duty
  const handleAssignKioskPlayer = (playerId: string) => {
    // Update the activity with the assigned player
    const updatedActivity = {
      ...currentActivity,
      kioskAssignedPlayerId: playerId
    };
    
    // Update the state
    setCurrentActivity(updatedActivity);
    
    // Call the update function to save changes
    if (onActivityUpdate) {
      onActivityUpdate(updatedActivity);
    }
    
    // Get player name for the toast
    const playerName = players.find(p => p.id === playerId)?.name || "Spelare";
    
    // Show success toast
    toast({
      title: "Kioskpass tilldelat",
      description: `${playerName} har tilldelats kioskpass för denna aktivitet.`,
    });
  };

  // Handle close with saving any changes
  const handleClose = () => {
    onClose();
  };

  // Handle adding players to the activity
  const handleAddPlayers = (playerIds: string[]) => {
    // Create a new participants array with the new players added
    const updatedParticipants = [
      ...(currentActivity.participants || []),
      ...playerIds
    ];
    
    // Create the updated activity
    const updatedActivity = {
      ...currentActivity,
      participants: updatedParticipants
    };
    
    // Update the local state
    setCurrentActivity(updatedActivity);
    
    // Call the update function to save changes
    if (onActivityUpdate) {
      onActivityUpdate(updatedActivity);
    }
    
    // Show success toast
    const playerNames = playerIds.map(id => 
      players.find(p => p.id === id)?.name || "Spelare"
    ).join(", ");
    
    toast({
      title: "Spelare tillagda",
      description: `${playerNames} har lagts till i aktiviteten.`,
    });
  };

  // Format the date
  const formattedDate = new Date(activity.date).toLocaleDateString('sv-SE');
  // Get day of week in Swedish
  const dayOfWeek = new Date(activity.date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  return (
    <Card className="w-full lg:max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-1 flex items-center">
              {currentActivity.name}
              <Badge 
                variant={currentActivity.type === "match" ? "default" : "secondary"}
                className="ml-3"
              >
                {currentActivity.type === "match" ? "Match" : "Cup"}
              </Badge>
            </CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {capitalizedDayOfWeek} {formattedDate}
                {currentActivity.time && (
                  <span className="ml-2 flex items-center">
                    <Clock className="h-4 w-4 ml-2 mr-1" />
                    {currentActivity.time}
                  </span>
                )}
              </div>
              
              {currentActivity.location && (
                <div className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{currentActivity.location.name}</span>
                  {currentActivity.location.description && (
                    <span className="text-muted-foreground ml-1">({currentActivity.location.description})</span>
                  )}
                  {currentActivity.location.gpsLink && (
                    <a 
                      href={currentActivity.location.gpsLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline text-sm"
                    >
                      GPS
                    </a>
                  )}
                </div>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="icon" onClick={() => onEdit(currentActivity)}>
                <Edit className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
                        <span>{player.name}</span>
                      </div>
                      <Badge variant="outline">
                        {player.grade === 'TRÄNARE' ? 'Tränare' : `Nivå ${player.grade}`}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">Inga deltagare tillagda än</p>
              )}

              {participatingPlayers.length < 12 && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingPlayers(!isAddingPlayers)}
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isAddingPlayers ? "Avbryt" : "Lägg till spelare"}
                </Button>
              )}

              {isAddingPlayers && (
                <AddPlayersToActivity 
                  activity={currentActivity}
                  players={players}
                  onAddPlayers={handleAddPlayers}
                  currentParticipantIds={currentActivity.participants || []}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {isKioskEligible() && (
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-semibold flex items-center mb-3">
              <Coffee className="h-5 w-5 mr-2" />
              Kioskansvarig
            </h3>
            
            <div className="flex justify-between items-center">
              <Badge variant={currentActivity.kioskAssignedPlayerId ? "default" : "outline"} className="mr-2">
                {getKioskPlayerName()}
              </Badge>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="h-8 px-3"
                  >
                    {currentActivity.kioskAssignedPlayerId ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Ändra
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Tilldela
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="end" side="top">
                  <Command>
                    <CommandInput placeholder="Sök spelare..." />
                    <CommandList>
                      <CommandEmpty>Inga spelare hittades.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-auto">
                        {players.map((player) => (
                          <CommandItem
                            key={player.id}
                            onSelect={() => handleAssignKioskPlayer(player.id)}
                            className="flex items-center justify-between"
                          >
                            <span>{player.name}</span>
                            {player.id === currentActivity.kioskAssignedPlayerId && (
                              <Check className="h-4 w-4" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={handleClose}>Stäng</Button>
      </CardFooter>
    </Card>
  );
}
