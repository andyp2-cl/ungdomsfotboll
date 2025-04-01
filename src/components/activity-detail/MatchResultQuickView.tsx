
import React from "react";
import { Activity } from "@/types/player";
import { QuickMatchResult } from "./QuickMatchResult";

interface MatchResultQuickViewProps {
  activity: Activity;
  onSave: (homeScore?: number, awayScore?: number) => Promise<void>;
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

  return (
    <QuickMatchResult 
      activity={activity}
      onSave={onSave}
      isReadOnly={isReadOnly}
    />
  );
}
