
import { useEffect } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { MatchResultSection, StatsSection } from "./sections";
import { DeleteActivityDialog } from "./DeleteActivityDialog";
import { ActivityDetailHeaderContent } from "./ActivityDetailHeaderContent";
import { HeaderActionButtons } from "./HeaderActionButtons";
import { ParticipantsSection } from "./ParticipantsSection";
import { useActivityDetailActions } from "./hooks/useActivityDetailActions";

interface ActivityDetailViewProps {
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
  extraContent?: React.ReactNode; // New prop for extra content
}

export function ActivityDetailView({ 
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
  onMatchResultUpdate,
  extraContent // New prop for extra content
}: ActivityDetailViewProps) {
  const {
    currentActivity,
    setCurrentActivity,
    isAddingPlayers,
    setIsAddingPlayers,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    clearParticipantsDialogOpen,
    setClearParticipantsDialogOpen,
    isHistorical,
    participatingPlayers,
    handleActivityUpdate,
    handleAddPlayers,
    handleRemovePlayer,
    handleClearAllParticipants
  } = useActivityDetailActions({
    activity,
    players,
    onActivityUpdate,
    onKioskAssignmentUpdate
  });
  
  useEffect(() => {
    setCurrentActivity(activity);
  }, [activity, setCurrentActivity]);

  const handleDeleteActivity = () => {
    if (onDeleteActivity) {
      onDeleteActivity(currentActivity.id);
      onClose();
    }
  };

  const handleClose = onBack || onClose;
  
  const isMatch = activity.type === "match";
  const formattedDate = new Date(activity.date).toLocaleDateString('sv-SE');
  const dayOfWeek = new Date(activity.date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  return (
    <Card className="w-full lg:max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <ActivityDetailHeaderContent 
            activity={currentActivity}
            formattedDate={formattedDate}
            capitalizedDayOfWeek={capitalizedDayOfWeek}
            isHistorical={isHistorical}
            formatResult={() => {
              if (currentActivity.homeScore !== undefined && currentActivity.awayScore !== undefined) {
                return `${currentActivity.homeScore}-${currentActivity.awayScore}`;
              }
              return currentActivity.result || "";
            }}
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
          <MatchResultSection 
            activity={activity}
            onMatchResultUpdate={onMatchResultUpdate}
          />
        )}

        {isMatch && (
          <StatsSection
            activity={currentActivity}
            players={players}
            participatingPlayers={participatingPlayers}
            updateActivity={handleActivityUpdate}
            isHistorical={isHistorical}
          />
        )}

        <ParticipantsSection 
          activity={currentActivity}
          participatingPlayers={participatingPlayers}
          isAddingPlayers={isAddingPlayers}
          setIsAddingPlayers={setIsAddingPlayers}
          clearParticipantsDialogOpen={clearParticipantsDialogOpen}
          setClearParticipantsDialogOpen={setClearParticipantsDialogOpen}
          onPlayerSelect={onPlayerSelect}
          onRemovePlayer={handleRemovePlayer}
          onClearAllParticipants={handleClearAllParticipants}
          onAddPlayers={handleAddPlayers}
          players={players}
        />
        
        {/* Render the extra content if provided */}
        {extraContent}
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
