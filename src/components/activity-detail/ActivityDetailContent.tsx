
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityDetailHeader } from "./ActivityDetailHeader";
import { ActivityParticipantSection } from "./ActivityParticipantSection";
import { ActivityStatsSection } from "./ActivityStatsSection";
import { ActivityCupMatches } from "./ActivityCupMatches";
import { ActivityResultSection } from "./match-result";
import { ParticipantsList } from "./ParticipantsList";

interface ActivityDetailContentProps {
  activity: Activity;
  players: Player[];
  onActivityUpdate: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  onKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  onActivitySelect?: (activity: Activity) => void;
  relatedActivities?: Activity[];
  cupMatches?: Activity[];
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
  allActivities?: Activity[];
}

export function ActivityDetailContent({
  activity,
  players,
  onActivityUpdate,
  onPlayerSelect,
  onKioskAssignmentUpdate,
  onActivitySelect,
  relatedActivities = [],
  cupMatches = [],
  onMatchResultUpdate,
  allActivities = []
}: ActivityDetailContentProps) {
  // Calculate if activity is historical
  const isHistorical = (() => {
    const activityDate = new Date(activity.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activityDate < today;
  })();
  
  // Filter players participating in this activity
  const participatingPlayers = players.filter(
    (player) => activity.participants?.includes(player.id)
  );

  // Handle direct updates to the activity
  const updateActivity = (updatedActivity: Activity) => {
    onActivityUpdate(updatedActivity);
  };

  return (
    <div className="space-y-6">
      {/* Activity header shows basic info, but not with full controls */}
      <div className="border rounded-md p-4">
        <h2 className="text-xl font-semibold mb-3">{activity.name}</h2>
        <p className="text-muted-foreground">
          {new Date(activity.date).toLocaleDateString()} {activity.time && `• ${activity.time}`}
          {activity.location && ` • ${activity.location.name}`}
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            {activity.type === "match" ? "Match" : "Cup"}
          </span>
        </div>
      </div>
      
      {/* Show Match Result for match type activities */}
      {activity.type === "match" && (
        <ActivityResultSection 
          activity={activity} 
          isHistorical={isHistorical}
          updateActivity={updateActivity}
          onMatchResultUpdate={onMatchResultUpdate}
          participatingPlayers={participatingPlayers} 
        />
      )}

      {/* For cup type, show related matches */}
      {activity.type === "cup" && cupMatches.length > 0 && (
        <ActivityCupMatches 
          cupMatches={cupMatches}
          onActivitySelect={onActivitySelect}
        />
      )}
      
      {/* Related activities (if this is a cup match, show its parent cup) */}
      {relatedActivities.length > 0 && (
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-semibold mb-3">Relaterade aktiviteter</h3>
          <ul className="space-y-2">
            {relatedActivities.map(activity => (
              <li 
                key={activity.id}
                onClick={() => onActivitySelect?.(activity)}
                className="cursor-pointer hover:bg-gray-50 p-2 rounded-md"
              >
                {activity.name} - {new Date(activity.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Participant section */}
      <ActivityParticipantSection 
        activity={activity}
        players={players}
        updateActivity={updateActivity}
        onPlayerSelect={onPlayerSelect}
      />
      
      {/* Stats section for matches */}
      {activity.type === "match" && (
        <ActivityStatsSection 
          activity={activity}
          players={players}
          participatingPlayers={participatingPlayers}
          updateActivity={updateActivity}
          isHistorical={isHistorical}
        />
      )}
    </div>
  );
}
