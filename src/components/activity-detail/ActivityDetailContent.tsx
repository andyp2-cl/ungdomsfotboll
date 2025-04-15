
import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityDetailHeader } from "./ActivityDetailHeader";
import { ActivityParticipantSection } from "./ActivityParticipantSection";
import { ActivityStatsSection } from "./ActivityStatsSection";
import { ActivityCupMatches } from "./ActivityCupMatches";
import { ActivityResultSection } from "./match-result";
import { ParticipantsList } from "./ParticipantsList";
import { QuickMatchResult } from "./QuickMatchResult";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  // For cup matches, find the parent cup
  const parentCup = activity.cupId && allActivities 
    ? allActivities.find(a => a.id === activity.cupId) 
    : undefined;

  // Handle match result updates
  const handleMatchResultUpdate = async (homeScore?: number, awayScore?: number) => {
    if (onMatchResultUpdate) {
      await onMatchResultUpdate(activity.id, homeScore, awayScore);
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity header shows basic info, but not with full controls */}
      <div className="border rounded-md p-4">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          {activity.name}
          {activity.cupId && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              Cupmatch
            </Badge>
          )}
        </h2>
        <p className="text-muted-foreground">
          {new Date(activity.date).toLocaleDateString()} {activity.time && `• ${activity.time}`}
          {activity.location && ` • ${activity.location.name}`}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            {activity.type === "match" ? "Match" : "Cup"}
          </span>
          
          {/* If this is a cup match, show link to parent cup */}
          {parentCup && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onActivitySelect?.(parentCup)}
            >
              <Trophy className="h-3 w-3 mr-1" />
              Gå till {parentCup.name}
            </Button>
          )}
        </div>
      </div>
      
      {/* Show Match Result for match type activities */}
      {activity.type === "match" && (
        <ActivityResultSection 
          activity={activity} 
          isHistorical={isHistorical}
          updateActivity={updateActivity}
          onMatchResultUpdate={onMatchResultUpdate ? 
            (activityId, homeScore, awayScore) => onMatchResultUpdate(activityId, homeScore, awayScore) : 
            undefined
          }
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
                className="cursor-pointer hover:bg-gray-50 p-2 rounded-md flex items-center justify-between"
              >
                <div>
                  {activity.name} - {new Date(activity.date).toLocaleDateString()}
                  {activity.homeScore !== undefined && activity.awayScore !== undefined && (
                    <span className="ml-2 font-medium">
                      {activity.homeScore}-{activity.awayScore}
                    </span>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Match Result Quick View for cup matches */}
      {activity.type === "match" && (
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-semibold mb-3">Snabbresultat</h3>
          <QuickMatchResult
            activity={activity}
            onSave={handleMatchResultUpdate}
            isReadOnly={false}
          />
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
