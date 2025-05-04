
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isHomeMatch, extractTeamNames } from "./utils";

interface SimpleResultViewProps {
  activity: Activity;
  onMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
}

export function SimpleResultView({ activity, onMatchResultUpdate }: SimpleResultViewProps) {
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isSaving, setIsSaving] = useState(false);
  
  // Extract team names
  const teamNames = extractTeamNames(activity);
  const isHome = isHomeMatch(activity);
  const homeTeam = teamNames.homeTeam || "Hemmalag";
  const awayTeam = teamNames.awayTeam || "Bortalag";
  
  // Determine if we have existing scores
  const hasExistingScores = activity.homeScore !== undefined && activity.awayScore !== undefined;
  
  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const success = await onMatchResultUpdate(activity.id, homeScore, awayScore);
      console.log(`Result update for ${activity.id}: ${success ? "successful" : "failed"}`);
      
      if (success) {
        console.log("Successfully updated match result");
      }
    } catch (error) {
      console.error("Error saving match result:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-4 border rounded-md p-4">
      {hasExistingScores && (
        <div className="text-center mb-4">
          <div className="text-xl font-bold">
            {activity.homeScore} - {activity.awayScore}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {homeTeam} - {awayTeam}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-5 gap-2 items-center">
        <div className="col-span-2">
          <div className="text-sm text-center mb-1">{homeTeam}</div>
          <Input
            type="number"
            min={0}
            value={homeScore === undefined ? "" : homeScore}
            onChange={(e) => setHomeScore(e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
            className="text-center"
          />
        </div>
        <div className="col-span-1 text-center text-2xl font-bold">-</div>
        <div className="col-span-2">
          <div className="text-sm text-center mb-1">{awayTeam}</div>
          <Input
            type="number"
            min={0}
            value={awayScore === undefined ? "" : awayScore}
            onChange={(e) => setAwayScore(e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
            className="text-center"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleSave} 
        disabled={isSaving} 
        className="w-full"
      >
        {isSaving ? "Sparar..." : "Spara resultat"}
      </Button>
    </div>
  );
}
