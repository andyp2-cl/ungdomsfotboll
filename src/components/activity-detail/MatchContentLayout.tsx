
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityParticipantSection } from "./ActivityParticipantSection";
import { ActivityStatsSection } from "./ActivityStatsSection";
import { MatchReportSection } from "./MatchReportSection";

interface MatchContentLayoutProps {
  activity: Activity;
  players: Player[];
  participatingPlayers: Player[];
  isHistorical: boolean;
  onActivityUpdate: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function MatchContentLayout({
  activity,
  players,
  participatingPlayers,
  isHistorical,
  onActivityUpdate,
  onPlayerSelect
}: MatchContentLayoutProps) {
  const updateActivity = async (updatedActivity: Activity) => {
    await onActivityUpdate(updatedActivity);
  };

  return (
    <div className="space-y-4">
      {/* Main content grid - responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column - Participants */}
        <div className="space-y-3">
          <ActivityParticipantSection 
            activity={activity}
            players={players}
            updateActivity={updateActivity}
            onPlayerSelect={onPlayerSelect}
          />
        </div>
        
        {/* Right column - Stats */}
        <div className="space-y-3">
          <ActivityStatsSection 
            activity={activity}
            players={players}
            participatingPlayers={participatingPlayers}
            updateActivity={updateActivity}
            isHistorical={isHistorical}
          />
        </div>
      </div>

      {/* Match report section - full width for historical matches */}
      {isHistorical && (
        <MatchReportSection 
          activity={activity}
          updateActivity={updateActivity}
          isHistorical={isHistorical}
        />
      )}
    </div>
  );
}
