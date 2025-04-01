
import React from "react";
import { Activity, Player } from "@/types/player";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { ActivityMatchStats } from "./ActivityMatchStats";
import { ActivityKioskAssignment } from "./ActivityKioskAssignment";
import { ActivityCupMatches } from "./ActivityCupMatches";
import { ActivityParticipants } from "./ActivityParticipants";
import { ActivityHeader } from "./ActivityHeader";
import { ActivityMatchResult } from "./ActivityMatchResult";

interface ActivityDetailContentProps {
  activity: Activity;
  players: Player[];
  onUpdate: (activity: Activity) => void;
  onKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  onActivitySelect?: (activity: Activity | null) => void;
  cupMatches?: Activity[];
  isHistorical?: boolean;
}

export function ActivityDetailContent({
  activity,
  players,
  onUpdate,
  onKioskUpdate,
  onActivitySelect,
  cupMatches = [],
  isHistorical = false
}: ActivityDetailContentProps) {
  // Find participants
  const participantPlayers = players.filter(player => 
    activity.participants?.includes(player.id)
  );

  // Determine if this is a cup
  const isCup = activity.type === "cup";

  // Calculate if the activity is historical based on date if not explicitly provided
  const isHistoricalByDate = !isHistorical && 
    new Date(activity.date) < new Date(new Date().setHours(0, 0, 0, 0));
  
  // Use either the provided value or calculate based on date
  const isActivityHistorical = isHistorical || isHistoricalByDate;

  return (
    <Card>
      <ActivityHeader activity={activity} />

      <CardContent className="pb-3 space-y-6">
        {/* Match Result (only for matches) */}
        {activity.type === "match" && (
          <ActivityMatchResult 
            activity={activity}
            updateActivity={onUpdate}
            isHistorical={isActivityHistorical}
          />
        )}
        
        {/* Player statistics (only for matches) */}
        {activity.type === "match" && (
          <ActivityMatchStats 
            activity={activity} 
            players={players}
            participatingPlayers={participantPlayers}
            updateActivity={onUpdate}
            isHistorical={isActivityHistorical}
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

        {/* Kiosk assignment section (only for matches) */}
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
