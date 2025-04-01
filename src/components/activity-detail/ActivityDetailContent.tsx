
import React from "react";
import { Activity, Player } from "@/types/player";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { ActivityMatchStats } from "./ActivityMatchStats";
import { ActivityKioskAssignment } from "./ActivityKioskAssignment";
import { ActivityCupMatches } from "./ActivityCupMatches";
import { ActivityParticipants } from "./ActivityParticipants";

interface ActivityDetailContentProps {
  activity: Activity;
  players: Player[];
  onUpdate: (activity: Activity) => void;
  onKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  onActivitySelect?: (activity: Activity | null) => void;
  cupMatches?: Activity[];
}

export function ActivityDetailContent({
  activity,
  players,
  onUpdate,
  onKioskUpdate,
  onActivitySelect,
  cupMatches = []
}: ActivityDetailContentProps) {
  // Find participants
  const participantPlayers = players.filter(player => 
    activity.participants?.includes(player.id)
  );

  // Determine if this is a cup
  const isCup = activity.type === "cup";

  return (
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
  );
}
