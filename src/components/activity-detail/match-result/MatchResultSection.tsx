
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { SimpleResultView } from "@/components/match-result/SimpleResultView";

interface MatchResultSectionProps {
  activity: Activity;
  onMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
}

export function MatchResultSection({ activity, onMatchResultUpdate }: MatchResultSectionProps) {
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await onMatchResultUpdate(activity.id, homeScore, awayScore);
      console.log("Match result saved:", homeScore, "-", awayScore);
    } catch (error) {
      console.error("Error saving match result:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matchresultat</h3>
      
      {/* Show current result */}
      {(activity.homeScore !== undefined || activity.awayScore !== undefined) && (
        <div className="mb-4">
          <SimpleResultView activity={activity} />
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hemmalag</label>
          <input
            type="number"
            min="0"
            value={homeScore === undefined ? "" : homeScore}
            onChange={(e) => setHomeScore(e.target.value === "" ? undefined : Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex items-center justify-center">
          <span className="text-lg font-bold">-</span>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Bortalag</label>
          <input
            type="number"
            min="0"
            value={awayScore === undefined ? "" : awayScore}
            onChange={(e) => setAwayScore(e.target.value === "" ? undefined : Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSaving ? "Sparar..." : "Spara resultat"}
      </button>
    </div>
  );
}
