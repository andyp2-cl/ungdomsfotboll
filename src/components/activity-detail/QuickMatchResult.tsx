
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { isHomeMatch } from "./match-result/utils";

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
      <div className="flex items-center justify-center space-x-4 my-4">
        <div className="text-center">
          <p className="text-sm font-medium mb-1">{homeTeamLabel}</p>
          <div className="bg-muted w-12 h-12 flex items-center justify-center rounded-md text-xl font-bold">
            {formattedHomeScore}
          </div>
        </div>
        <span className="text-2xl font-bold">-</span>
        <div className="text-center">
          <p className="text-sm font-medium mb-1">{awayTeamLabel}</p>
          <div className="bg-muted w-12 h-12 flex items-center justify-center rounded-md text-xl font-bold">
            {formattedAwayScore}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 mt-4">
      <h3 className="text-base font-medium mb-3">Uppdatera matchresultat</h3>
      
      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        <div className="text-center">
          <label className="block text-sm font-medium mb-1">{homeTeamLabel}</label>
          <Input
            type="number"
            min={0}
            value={homeScore === undefined ? '' : homeScore}
            onChange={(e) => setHomeScore(e.target.value === '' ? undefined : parseInt(e.target.value))}
            className="text-center"
          />
        </div>
        
        <div className="flex justify-center items-center">
          <span className="text-xl font-bold">-</span>
        </div>
        
        <div className="text-center">
          <label className="block text-sm font-medium mb-1">{awayTeamLabel}</label>
          <Input
            type="number"
            min={0}
            value={awayScore === undefined ? '' : awayScore}
            onChange={(e) => setAwayScore(e.target.value === '' ? undefined : parseInt(e.target.value))}
            className="text-center"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleSave}
        className="w-full"
        disabled={isSaving}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "Sparar..." : "Spara resultat"}
      </Button>
    </div>
  );
}
