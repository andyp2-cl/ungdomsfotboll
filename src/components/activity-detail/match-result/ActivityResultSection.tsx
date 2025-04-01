
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { ScoreSection } from "./ScoreSection";
import { useResultSaver } from "./ResultSaver";

interface ActivityResultSectionProps {
  activity: Activity;
  isHistorical: boolean;
  updateActivity: (updatedActivity: Activity) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function ActivityResultSection({ 
  activity, 
  isHistorical,
  updateActivity,
  onMatchResultUpdate
}: ActivityResultSectionProps) {
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isSaving, setIsSaving] = useState(false);
  const [manualWinStatus, setManualWinStatus] = useState<boolean | undefined>(activity.isWin);
  
  // Update local state when activity changes
  useEffect(() => {
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
    setManualWinStatus(activity.isWin);
  }, [activity]);

  // Use the result saver hook
  const { saveMatchResult } = useResultSaver({
    activity,
    updateActivity,
    onMatchResultUpdate
  });

  // Handle save button click
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMatchResult(homeScore, awayScore, manualWinStatus);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matchresultat</h3>
      
      <ScoreSection 
        activity={activity}
        homeScore={homeScore}
        awayScore={awayScore}
        setHomeScore={setHomeScore}
        setAwayScore={setAwayScore}
        manualWinStatus={manualWinStatus}
        setManualWinStatus={setManualWinStatus}
        onSave={handleSave}
        isSaving={isSaving}
        isHistorical={isHistorical}
      />
    </div>
  );
}
