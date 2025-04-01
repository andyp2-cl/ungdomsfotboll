
import React from "react";

interface GoalStatsSummaryProps {
  totalStats: {
    goals: number;
    assists: number;
  };
  playerCount: number;
}

export function GoalStatsSummary({ totalStats, playerCount }: GoalStatsSummaryProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <div className="p-4 bg-green-50 text-green-700 rounded-md text-center">
          <div className="text-xl font-bold">{totalStats.goals}</div>
          <div className="text-sm">Totalt antal mål</div>
        </div>
        <div className="p-4 bg-blue-50 text-blue-700 rounded-md text-center">
          <div className="text-xl font-bold">{totalStats.assists}</div>
          <div className="text-sm">Totalt antal assist</div>
        </div>
        <div className="p-4 bg-gray-50 text-gray-700 rounded-md text-center">
          <div className="text-xl font-bold">{playerCount}</div>
          <div className="text-sm">Aktiva spelare</div>
        </div>
      </div>
    </div>
  );
}
