
import React from "react";
import { Activity } from "@/types/player";
import { QuickMatchResult } from "../QuickMatchResult";
import { getResultColorClass } from "./match-result/utils";

interface MatchResultQuickViewProps {
  activity: Activity;
  onSave: (homeScore?: number, awayScore?: number, isWin?: boolean) => Promise<void>;
  isReadOnly?: boolean;
}

export function MatchResultQuickView({ 
  activity, 
  onSave,
  isReadOnly = false
}: MatchResultQuickViewProps) {
  if (activity.type !== "match") {
    return null;
  }

  const resultColorClass = getResultColorClass(activity);

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matchresultat</h3>
      <QuickMatchResult 
        activity={activity}
        onSave={onSave}
        isReadOnly={isReadOnly}
        resultColorClass={resultColorClass}
      />
    </div>
  );
}
