
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { ScoreSection } from "./ScoreSection";
import { useResultSaver } from "./ResultSaver";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityResultSectionProps {
  activity: Activity;
  isHistorical: boolean;
  updateActivity: (updatedActivity: Activity) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
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
  const isMobile = useIsMobile();
  
  // Update local state when activity changes
  useEffect(() => {
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
    
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
      awayScore
    });
    
    try {
      await saveMatchResult(homeScore, awayScore);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`border rounded-md ${isMobile ? 'p-3' : 'p-4'}`}>
      <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-3`}>Matchresultat</h3>
      
      <ScrollArea className={isMobile ? "max-h-[60vh]" : ""}>
        <ScoreSection 
          activity={activity}
          homeScore={homeScore}
          awayScore={awayScore}
          setHomeScore={setHomeScore}
          setAwayScore={setAwayScore}
          onSave={handleSave}
          isSaving={isSaving}
          isHistorical={isHistorical}
        />
      </ScrollArea>
    </div>
  );
}
