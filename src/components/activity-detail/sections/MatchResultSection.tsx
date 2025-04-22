import React from "react";
import { Activity } from "@/types/player";

interface MatchResultSectionProps {
  activity: Activity;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function MatchResultSection({ activity, onMatchResultUpdate }: MatchResultSectionProps) {
  return null;
}
