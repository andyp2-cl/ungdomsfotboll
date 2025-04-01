
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { isHomeMatch } from "./match-result/utils";
import { ReadOnlyScoreDisplay } from "./match-result/ReadOnlyScoreDisplay";
import { EditableScoreForm } from "./match-result/EditableScoreForm";

interface QuickMatchResultProps {
  activity: Activity;
  onSave: (homeScore?: number, awayScore?: number) => Promise<void>;
  isReadOnly?: boolean;
}

export function QuickMatchResult({ 
  activity, 
  onSave,
  isReadOnly = false
}: QuickMatchResultProps) {
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isSaving, setIsSaving] = useState(false);

  // Update state when activity changes
  useEffect(() => {
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
  }, [activity]);

  const isHome = isHomeMatch(activity);
  
  const handleSave = async () => {
    console.log("QuickMatchResult handleSave called with:", {homeScore, awayScore});
    setIsSaving(true);
    try {
      await onSave(homeScore, awayScore);
    } catch (error) {
      console.error("Error saving match result:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Determine team labels based on if it's a home or away match
  const homeTeamLabel = isHome ? "Hässleholms IF" : "Motståndare";
  const awayTeamLabel = isHome ? "Motståndare" : "Hässleholms IF";

  // Format scores for display
  const formattedHomeScore = homeScore !== undefined ? homeScore : '-';
  const formattedAwayScore = awayScore !== undefined ? awayScore : '-';
  
  if (isReadOnly) {
    return (
      <ReadOnlyScoreDisplay
        homeTeamLabel={homeTeamLabel}
        awayTeamLabel={awayTeamLabel}
        homeScore={formattedHomeScore}
        awayScore={formattedAwayScore}
      />
    );
  }

  return (
    <EditableScoreForm
      homeTeamLabel={homeTeamLabel}
      awayTeamLabel={awayTeamLabel}
      homeScore={homeScore}
      awayScore={awayScore}
      onHomeScoreChange={setHomeScore}
      onAwayScoreChange={setAwayScore}
      onSave={handleSave}
      isSaving={isSaving}
    />
  );
}
