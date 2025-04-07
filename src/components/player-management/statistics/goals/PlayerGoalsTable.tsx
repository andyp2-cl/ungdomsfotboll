
import React from "react";
import { PlayerGoalStat } from "./calculateGoalStats";

interface PlayerGoalsTableProps {
  playerStats: PlayerGoalStat[];
}

export function PlayerGoalsTable({ playerStats }: PlayerGoalsTableProps) {
  return (
    <div className="border rounded-md mt-4">
      <div className="grid grid-cols-4 font-semibold p-3 border-b">
        <div>Namn</div>
        <div className="text-center">Matcher</div>
        <div className="text-center">Mål</div>
        <div className="text-center">Assist</div>
      </div>
      <div className="divide-y max-h-[500px] overflow-y-auto">
        {playerStats.map(player => (
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
