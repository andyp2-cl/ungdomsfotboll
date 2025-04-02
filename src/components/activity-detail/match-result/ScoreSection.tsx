
import React from "react";
import { Activity } from "@/types/player";
import { ScoreDisplay } from "./ScoreDisplay";
import { ScoreForm } from "./ScoreForm";

interface ScoreSectionProps {
  activity: Activity;
  homeScore: number | undefined;
  awayScore: number | undefined;
  setHomeScore: (score: number | undefined) => void;
  setAwayScore: (score: number | undefined) => void;
  manualWinStatus: boolean | undefined;
  setManualWinStatus: (status: boolean | undefined) => void;
  onSave: () => void;
  isSaving: boolean;
  isHistorical: boolean;
}

export function ScoreSection({
  activity,
  homeScore,
  awayScore,
  setHomeScore,
  setAwayScore,
  manualWinStatus,
  setManualWinStatus,
  onSave,
  isSaving,
  isHistorical
}: ScoreSectionProps) {
  // Determine if we have a valid result to display
  const hasResult = homeScore !== undefined && awayScore !== undefined;

  if (isHistorical && hasResult) {
    return (
      <ScoreDisplay 
        activity={activity} 
        homeScore={homeScore} 
        awayScore={awayScore} 
      />
    );
  } else {
    return (
      <ScoreForm 
        activity={activity}
        homeScore={homeScore}
        awayScore={awayScore}
        setHomeScore={setHomeScore}
        setAwayScore={setAwayScore}
        manualWinStatus={manualWinStatus}
        setManualWinStatus={setManualWinStatus}
        onSave={onSave}
        isSaving={isSaving}
      />
    );
  }
}
