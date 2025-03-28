
import { useState, useEffect } from "react";
import { Activity, Player, KioskSchedule } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X, Users, MapPin, Clock, Edit, UserPlus } from "lucide-react";
import { KioskSchedule as KioskScheduleComponent } from "./KioskSchedule";
import { mockKioskSchedules } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { AddPlayersToActivity } from "./AddPlayersToActivity";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ActivityDetailProps {
  activity: Activity;
  players: Player[];
  onClose: () => void;
  onEdit?: (activity: Activity) => void;
  onKioskScheduleUpdate?: (scheduleId: string, updatedSchedule: KioskSchedule) => void;
  onActivityUpdate?: (updatedActivity: Activity) => void;
}

export function ActivityDetail({ 
  activity, 
  players, 
  onClose, 
  onEdit, 
  onKioskScheduleUpdate,
  onActivityUpdate
}: ActivityDetailProps) {
  const { toast } = useToast();
  // State to hold the current kiosk schedule
  const [currentSchedule, setCurrentSchedule] = useState<KioskSchedule | undefined>(undefined);
  const [currentActivity, setCurrentActivity] = useState<Activity>(activity);
  const [isAddingPlayers, setIsAddingPlayers] = useState(false);
  
  // Fetch the schedule when the activity changes
  useEffect(() => {
    if (activity.kioskScheduleId) {
      const schedule = mockKioskSchedules.find(s => s.id === activity.kioskScheduleId);
      setCurrentSchedule(schedule);
    }
  }, [activity.kioskScheduleId]);
  
  // Find all players participating in this activity
  const participatingPlayers = players.filter(
    (player) => currentActivity.participants?.includes(player.id)
  );

  // Handle assigning a player to a kiosk slot
  const handleAssignPlayer = (slotId: string, playerId: string) => {
    if (!currentSchedule) return;
    
    // Create a new schedule with the updated slot assignment
    const updatedSchedule = {
      ...currentSchedule,
      slots: currentSchedule.slots.map(slot => 
        slot.id === slotId ? { ...slot, assignedPlayerId: playerId } : slot
      )
    };
    
    // Update the state
    setCurrentSchedule(updatedSchedule);
    
    // Immediately call the update function to ensure it's saved
    if (onKioskScheduleUpdate) {
      onKioskScheduleUpdate(updatedSchedule.id, updatedSchedule);
    }
    
    // Get player name for the toast
    const playerName = players.find(p => p.id === playerId)?.name || "Spelare";
    const slotTime = currentSchedule.slots.find(s => s.id === slotId)?.time || "";
    
    // Show success toast
    toast({
      title: "Kioskpass tilldelat",
      description: `${playerName} har tilldelats kioskpasset ${slotTime}.`,
    });
  };

  // Handle close with saving kiosk schedule changes
  const handleClose = () => {
    // If there's a schedule and an update function, call it with the updated schedule
    if (currentSchedule && onKioskScheduleUpdate) {
      onKioskScheduleUpdate(currentSchedule.id, currentSchedule);
    }
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
                      <span>{player.name}</span>
                      <Badge variant="outline">Betyg {player.grade}</Badge>
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

        {currentSchedule && (
          <div>
            <h3 className="text-lg font-semibold flex items-center mb-3">Kioskschema</h3>
            <KioskScheduleComponent 
              schedule={currentSchedule} 
              players={players} 
              onAssignPlayer={handleAssignPlayer} 
            />
          </div>
        )}
        
        {!currentSchedule && currentActivity.kioskScheduleId && (
          <div className="p-4 border rounded-md bg-muted/20">
            <p className="text-muted-foreground text-center">
              Kioskschema finns men kunde inte laddas
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={handleClose}>Stäng</Button>
      </CardFooter>
    </Card>
  );
}
