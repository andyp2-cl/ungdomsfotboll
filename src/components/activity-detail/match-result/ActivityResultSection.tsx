
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { ScoreSection } from "./ScoreSection";
import { useResultSaver } from "./ResultSaver";
import { GradePieChart } from "./GradePieChart";
import { Trophy, Users } from "lucide-react";

interface ActivityResultSectionProps {
  activity: Activity;
  isHistorical: boolean;
  updateActivity: (updatedActivity: Activity) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
  participatingPlayers?: any[];  // Added participatingPlayers prop
}

export function ActivityResultSection({ 
  activity, 
  isHistorical,
  updateActivity,
  onMatchResultUpdate,
  participatingPlayers = []  // Default to empty array if not provided
}: ActivityResultSectionProps) {
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isSaving, setIsSaving] = useState(false);
  const [manualWinStatus, setManualWinStatus] = useState<boolean | undefined>(activity.isWin);
  
  // Update local state when activity changes
  useEffect(() => {
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
    
    // Important: Make sure we keep the three-state boolean for win status
    setManualWinStatus(activity.isWin);
    
    console.log("ActivityResultSection updated with activity:", { 
      id: activity.id,
      homeScore: activity.homeScore,
      awayScore: activity.awayScore,
      isWin: activity.isWin,
      isDraw: activity.homeScore === activity.awayScore
    });
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
    console.log("Saving match result with:", {
      homeScore,
      awayScore,
      manualWinStatus: manualWinStatus === undefined ? "undefined/draw" : manualWinStatus
    });
    
    try {
      await saveMatchResult(homeScore, awayScore, manualWinStatus);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Trophy className="h-5 w-5 mr-2 text-amber-500" />
        Matchresultat
      </h3>
      
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
      
      {/* Add the Grade Pie Chart */}
      {participatingPlayers && participatingPlayers.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            <h3 className="font-semibold">Deltagarsammansättning</h3>
          </div>
          <GradePieChart 
            activity={activity} 
            participatingPlayers={participatingPlayers} 
          />
        </div>
      )}
    </div>
  );
}
