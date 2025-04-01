
import { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X, MapPin, Clock, Edit, Trash2 } from "lucide-react";
import { ActivityHeader } from "./ActivityHeader";
import { ActivityParticipants } from "./ActivityParticipants";
import { ActivityMatchResult } from "./ActivityMatchResult";
import { ActivityMatchStats } from "./ActivityMatchStats";
import { ActivityKioskAssignment } from "./ActivityKioskAssignment";
import { ActivityCupMatches } from "./ActivityCupMatches";
import { DeleteActivityDialog } from "./DeleteActivityDialog";

interface ActivityDetailProps {
  activity: Activity;
  players: Player[];
  onClose: () => void;
  onEdit?: (activity: Activity) => void;
  onActivityUpdate?: (updatedActivity: Activity) => void;
  onKioskAssignmentUpdate?: (activityId: string, playerId?: string) => void;
  onActivitySelect?: (activity: Activity | null) => void;
  onDeleteActivity?: (activityId: string) => void;
  allActivities?: Activity[];
  cupMatches?: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function ActivityDetail({ 
  activity, 
  players, 
  onClose, 
  onEdit, 
  onActivityUpdate,
  onKioskAssignmentUpdate,
  onActivitySelect,
  onDeleteActivity,
  allActivities,
  cupMatches = [],
  onPlayerSelect
}: ActivityDetailProps) {
  const [currentActivity, setCurrentActivity] = useState<Activity>(activity);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const isHistorical = new Date(activity.date) < new Date(new Date().setHours(0, 0, 0, 0));

  const updateActivity = (updatedActivity: Activity) => {
    setCurrentActivity(updatedActivity);
    if (onActivityUpdate) {
      onActivityUpdate(updatedActivity);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const formattedDate = new Date(activity.date).toLocaleDateString('sv-SE');
  const dayOfWeek = new Date(activity.date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  const formatResult = () => {
    if (currentActivity.homeScore !== undefined && currentActivity.awayScore !== undefined) {
      return `${currentActivity.homeScore}-${currentActivity.awayScore}`;
    }
    return currentActivity.result || "";
  };

  return (
    <Card className="w-full lg:max-w-3xl mx-auto">
      <CardHeader>
        <ActivityHeader 
          activity={currentActivity}
          formattedDate={formattedDate}
          capitalizedDayOfWeek={capitalizedDayOfWeek}
          isHistorical={isHistorical}
          formatResult={formatResult}
          onEdit={onEdit}
          onDeleteOpen={() => setIsDeleteDialogOpen(true)}
          onClose={handleClose}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <ActivityParticipants
          activity={currentActivity}
          players={players}
          updateActivity={updateActivity}
          onPlayerSelect={onPlayerSelect}
        />

        {isHistorical && currentActivity.type === "match" && (
          <>
            <ActivityMatchResult
              activity={currentActivity}
              updateActivity={updateActivity}
            />
            
            <ActivityMatchStats
              activity={currentActivity}
              players={players}
              participatingPlayers={players.filter(
                (player) => currentActivity.participants?.includes(player.id)
              )}
              updateActivity={updateActivity}
            />
          </>
        )}

        {currentActivity.type === "match" && (
          <ActivityKioskAssignment
            activity={currentActivity}
            players={players}
            updateActivity={updateActivity}
            onKioskAssignmentUpdate={onKioskAssignmentUpdate}
          />
        )}

        {currentActivity.type === "cup" && (
          <ActivityCupMatches
            cupMatches={cupMatches}
            onActivitySelect={onActivitySelect}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={handleClose}>Stäng</Button>
      </CardFooter>

      {onDeleteActivity && (
        <DeleteActivityDialog 
          activityName={currentActivity.name}
          isOpen={isDeleteDialogOpen} 
          onOpenChange={setIsDeleteDialogOpen} 
          onDelete={() => {
            onDeleteActivity(currentActivity.id);
            onClose();
          }}
        />
      )}
    </Card>
  );
}
