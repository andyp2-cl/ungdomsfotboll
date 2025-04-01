
import React from "react";

interface PlayerGoalStats {
  playerId: string;
  name: string;
  goals: number;
  assists: number;
  matches: number;
}

interface PlayerGoalsTableProps {
  playerStats: PlayerGoalStats[];
  limit?: number;
}

export function PlayerGoalsTable({ playerStats, limit = 20 }: PlayerGoalsTableProps) {
  return (
    <div className="border rounded-md mt-4">
      <div className="grid grid-cols-4 font-semibold p-3 border-b">
        <div>Namn</div>
        <div className="text-center">Matcher</div>
        <div className="text-center">Mål</div>
        <div className="text-center">Assist</div>
      </div>
      <div className="divide-y">
        {playerStats.slice(0, limit).map(player => (
          <div key={player.playerId} className="grid grid-cols-4 p-3">
            <div>{player.name}</div>
            <div className="text-center">{player.matches}</div>
            <div className="text-center text-green-600 font-semibold">{player.goals}</div>
            <div className="text-center text-blue-600 font-semibold">{player.assists}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
