
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Activity, Player } from "@/types/player";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Share2, 
  Trash2, 
  Users, 
  Edit, 
  Trophy 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  onBack: () => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => Promise<boolean>;
  onUpdate: (activity: Activity) => void;
  onKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  onActivitySelect?: (activity: Activity | null) => void;
  relatedActivities?: Activity[];
  cupMatches?: Activity[];
  allActivities?: Activity[];
  onClose?: () => void;
}

export function ActivityDetail({
  activity,
  players,
  onBack,
  onEdit,
  onDelete,
  onUpdate,
  onKioskUpdate,
  onActivitySelect,
  relatedActivities = [],
  cupMatches = [],
  allActivities = [],
  onClose
}: ActivityDetailProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine if this is a cup and find related matches
  const isCup = activity.type === "cup";

  // Find participants
  const participantPlayers = players.filter(player => 
    activity.participants?.includes(player.id)
  );

  // Assigned player for kiosk
  const assignedPlayer = players.find(
    player => player.id === activity.kioskAssignedPlayerId
  );

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await onDelete(activity.id);
      if (success) {
        setIsDeleteDialogOpen(false);
        onBack();
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header section with back button, title, and action buttons */}
      <ActivityHeader 
        activity={activity}
        onClose={onClose || onBack}
        onEdit={() => onEdit(activity)}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />

      {/* Main content card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <CardTitle>{activity.name}</CardTitle>
            <Badge variant={activity.type === "match" ? "default" : "secondary"}>
              {activity.type === "match" ? "Match" : "Cup"}
            </Badge>
          </div>
          <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              {new Date(activity.date).toLocaleDateString('sv-SE')}
            </span>
            {activity.time && (
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                {activity.time}
              </span>
            )}
            {activity.location && (
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                {activity.location.name}
                {activity.location.gpsLink && (
                  <a
                    href={activity.location.gpsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-500 hover:underline"
                  >
                    (Karta)
                  </a>
                )}
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3 space-y-6">
          {/* Match result section (only for matches) */}
          {activity.type === "match" && (
            <ActivityMatchResult 
              activity={activity} 
              updateActivity={onUpdate} 
            />
          )}

          {/* Player statistics (only for matches) */}
          {activity.type === "match" && (
            <ActivityMatchStats 
              activity={activity} 
              players={players}
              participatingPlayers={participantPlayers}
              updateActivity={onUpdate}
            />
          )}

          {/* Cup matches section (only for cups) */}
          {isCup && cupMatches && cupMatches.length > 0 && (
            <ActivityCupMatches 
              cupMatches={cupMatches}
              onActivitySelect={onActivitySelect}
            />
          )}

          {/* Participants section */}
          <ActivityParticipants 
            activity={activity}
            players={players}
            updateActivity={onUpdate}
          />

          {/* Kiosk assignment section */}
          {activity.type === "match" && (
            <ActivityKioskAssignment 
              activity={activity}
              players={players}
              updateActivity={onUpdate}
              onKioskAssignmentUpdate={onKioskUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <DeleteActivityDialog
        activityName={activity.name}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
      />
    </div>
  );
}
