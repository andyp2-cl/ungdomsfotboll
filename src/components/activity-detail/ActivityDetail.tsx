
import { useState, useEffect } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddPlayersToActivity } from "../AddPlayersToActivity";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ActivityResultSection } from "./match-result";
import { QuickMatchResult } from "./QuickMatchResult";
import { DeleteActivityDialog } from "./DeleteActivityDialog";
import { ActivityDetailHeaderContent } from "./ActivityDetailHeaderContent";
import { HeaderActionButtons } from "./HeaderActionButtons";
import { ParticipantActionButtons } from "./ParticipantActionButtons";
import { ParticipantsList } from "./ParticipantsList";
import { Badge } from "@/components/ui/badge";

interface ActivityDetailProps {
  activity: Activity;
  players: Player[];
  onClose: () => void;
  onBack?: () => void;
  onEdit?: (activity: Activity) => void;
  onActivityUpdate?: (updatedActivity: Activity) => void;
  onKioskAssignmentUpdate?: (activityId: string, playerId?: string) => void;
  onActivitySelect?: (activity: Activity | null) => void;
  onDeleteActivity?: (activityId: string) => void;
  allActivities?: Activity[];
  relatedActivities?: Activity[];
  cupMatches?: Activity[];
  onPlayerSelect?: (playerId: string) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function ActivityDetail({ 
  activity, 
  players, 
  onClose, 
  onBack, 
  onEdit, 
  onActivityUpdate,
  onKioskAssignmentUpdate,
  onActivitySelect,
  onDeleteActivity,
  allActivities,
  relatedActivities = [],
  cupMatches = [],
  onPlayerSelect,
  onMatchResultUpdate
}: ActivityDetailProps) {
  const { toast } = useToast();
  const [currentActivity, setCurrentActivity] = useState<Activity>(activity);
  const [isAddingPlayers, setIsAddingPlayers] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clearParticipantsDialogOpen, setClearParticipantsDialogOpen] = useState(false);
  
  useEffect(() => {
    setCurrentActivity(activity);
  }, [activity]);

  const isHistorical = new Date(activity.date) < new Date(new Date().setHours(0, 0, 0, 0));
  
  const participatingPlayers = players.filter(
    (player) => currentActivity.participants?.includes(player.id)
  );

  const handleActivityUpdate = (updatedActivity: Activity) => {
    setCurrentActivity(updatedActivity);
    
    if (onActivityUpdate) {
      onActivityUpdate(updatedActivity);
    }
  };

  const handleDeleteActivity = () => {
    if (onDeleteActivity) {
      onDeleteActivity(currentActivity.id);
      onClose();
    }
  };

  const handleClose = onBack || onClose;

  const handleAddPlayers = (playerIds: string[]) => {
    const updatedParticipants = [
      ...(currentActivity.participants || []),
      ...playerIds
    ];
    
    const updatedActivity = {
      ...currentActivity,
      participants: updatedParticipants
    };
    
    handleActivityUpdate(updatedActivity);
    
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
    
    const updatedParticipants = (currentActivity.participants || []).filter(
      id => id !== playerId
    );
    
    const updatedActivity = {
      ...currentActivity,
      participants: updatedParticipants
    };
    
    if (currentActivity.kioskAssignedPlayerId === playerId) {
      updatedActivity.kioskAssignedPlayerId = undefined;
      
      if (onKioskAssignmentUpdate) {
        onKioskAssignmentUpdate(currentActivity.id, undefined);
      }
    }
    
    handleActivityUpdate(updatedActivity);
    
    toast({
      title: "Spelare borttagen",
      description: `${player.name} har tagits bort från aktiviteten.`,
    });
  };

  const handleClearAllParticipants = () => {
    const updatedActivity = {
      ...currentActivity,
      participants: []
    };
    
    if (currentActivity.kioskAssignedPlayerId) {
      updatedActivity.kioskAssignedPlayerId = undefined;
      
      if (onKioskAssignmentUpdate) {
        onKioskAssignmentUpdate(currentActivity.id, undefined);
      }
    }
    
    handleActivityUpdate(updatedActivity);
    setClearParticipantsDialogOpen(false);
    
    toast({
      title: "Deltagarlista rensad",
      description: `Alla spelare har tagits bort från aktiviteten.`,
    });
  };

  const handleQuickResultSave = async (homeScore?: number, awayScore?: number) => {
    if (onMatchResultUpdate) {
      await onMatchResultUpdate(activity.id, homeScore, awayScore);
    }
  };

  const formatResult = () => {
    if (currentActivity.homeScore !== undefined && currentActivity.awayScore !== undefined) {
      return `${currentActivity.homeScore}-${currentActivity.awayScore}`;
    }
    return currentActivity.result || "";
  };

  const formattedDate = new Date(activity.date).toLocaleDateString('sv-SE');
  const dayOfWeek = new Date(activity.date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  const isMatch = activity.type === "match";

  return (
    <Card className="w-full lg:max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <ActivityDetailHeaderContent 
            activity={currentActivity}
            formattedDate={formattedDate}
            capitalizedDayOfWeek={capitalizedDayOfWeek}
            isHistorical={isHistorical}
            formatResult={formatResult}
          />
          <HeaderActionButtons 
            onEdit={onEdit}
            currentActivity={currentActivity}
            onDeleteActivity={onDeleteActivity}
            isDeleteDialogOpen={isDeleteDialogOpen}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            handleClose={handleClose}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isMatch && (
          <QuickMatchResult 
            activity={activity}
            onSave={handleQuickResultSave}
            isReadOnly={false}
          />
        )}

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
              <ParticipantsList
                participants={participatingPlayers}
                onPlayerSelect={onPlayerSelect}
                onRemovePlayer={handleRemovePlayer}
              />

              <ParticipantActionButtons 
                isAddingPlayers={isAddingPlayers}
                setIsAddingPlayers={setIsAddingPlayers}
                participantCount={participatingPlayers.length}
                handleClearAllParticipants={handleClearAllParticipants}
                isOpen={clearParticipantsDialogOpen}
                setIsOpen={setClearParticipantsDialogOpen}
              />

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

        {isMatch && (
          <ActivityResultSection
            activity={currentActivity}
            isHistorical={isHistorical}
            updateActivity={handleActivityUpdate}
            onMatchResultUpdate={onMatchResultUpdate}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={handleClose}>Stäng</Button>
      </CardFooter>

      <DeleteActivityDialog
        activityName={currentActivity.name}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteActivity}
      />
    </Card>
  );
}
