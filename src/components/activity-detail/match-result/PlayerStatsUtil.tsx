import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Player } from "@/types/player";
import { sortPlayersByGrade } from "@/utils/gradeUtils";

interface PlayerStatsUtilProps {
  activity: Activity;
  players: Player[];
  participatingPlayers: Player[];
  updateActivity: (activity: Activity) => void;
}

// This function prepares updated player stats based on match result
export function prepareUpdatedPlayerStats(
  activity: Activity,
  homeScore?: number,
  awayScore?: number,
  isWin?: boolean,
  isHomeTeam: boolean = true
) {
  // Start with existing player stats or create empty object
  const existingStats = activity.player_stats || {};
  
  return {
    // Keep existing goals and assists data
    goals: existingStats.goals || {},
    assists: existingStats.assists || {},
    // Update scores information
    scores: {
      home: homeScore,
      away: awayScore
    },
    // Update win status
    isWin
  };
}

export function PlayerStatsUtil({
  activity,
  players,
  participatingPlayers,
  updateActivity
}: PlayerStatsUtilProps) {
  // Sort participants by grade (A, B, C, D)
  const sortedParticipants = sortPlayersByGrade(participatingPlayers);
  
  const getPlayerGoals = (playerId: string) => {
    return activity.player_stats?.goals?.[playerId] || 0;
  };

  const getPlayerAssists = (playerId: string) => {
    return activity.player_stats?.assists?.[playerId] || 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spelarstatistik</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedParticipants.map((player) => (
          <div key={player.id} className="flex justify-between items-center">
            <span>{player.name}</span>
            <div className="flex items-center space-x-4">
              <span>Mål: {getPlayerGoals(player.id)}</span>
              <span>Assist: {getPlayerAssists(player.id)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
