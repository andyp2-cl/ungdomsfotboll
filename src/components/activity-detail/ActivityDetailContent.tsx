
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityDetailHeader } from "./ActivityDetailHeader";
import { ActivityParticipantSection } from "./ActivityParticipantSection";
import { ActivityStatsSection } from "./ActivityStatsSection";
import { ActivityCupMatches } from "./ActivityCupMatches";
import { ActivityResultSection } from "./match-result";
import { ParticipantsList } from "./ParticipantsList";
import { useActivityDetailActions } from "./hooks/useActivityDetailActions";

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
  const { 
    participatingPlayers,
    isHistorical,
    handleParticipantAdd,
    handleParticipantRemove
  } = useActivityDetailActions(activity, players);

  return (
    <div className="space-y-6">
      <ActivityDetailHeader 
        activity={activity} 
        isHistorical={isHistorical}
      />
      
      {/* Show Match Result for match type activities */}
      {activity.type === "match" && (
        <ActivityResultSection 
          activity={activity} 
          isHistorical={isHistorical}
          updateActivity={onActivityUpdate}
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
          <ParticipantsList 
            activities={relatedActivities}
            onSelect={onActivitySelect}
          />
        </div>
      )}

      {/* Participant section */}
      <ActivityParticipantSection 
        activity={activity}
        players={players}
        participatingPlayers={participatingPlayers}
        onParticipantAdd={handleParticipantAdd}
        onParticipantRemove={handleParticipantRemove}
        onKioskAssignmentUpdate={onKioskAssignmentUpdate}
        onPlayerSelect={onPlayerSelect}
        updateActivity={onActivityUpdate}
      />
      
      {/* Stats section for matches */}
      {activity.type === "match" && (
        <ActivityStatsSection 
          activity={activity}
          players={players}
          participatingPlayers={participatingPlayers}
          updateActivity={onActivityUpdate}
          isHistorical={isHistorical}
        />
      )}
    </div>
  );
}
