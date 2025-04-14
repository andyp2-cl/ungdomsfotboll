
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2 } from "lucide-react";

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
  const [justSaved, setJustSaved] = useState(false);

  // Update local state when activity changes
  useEffect(() => {
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
  }, [activity]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(homeScore, awayScore);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (error) {
      console.error("Error saving match result:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    homeScore !== activity.homeScore || 
    awayScore !== activity.awayScore;

  if (isReadOnly) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-lg font-medium">
          {activity.homeScore !== undefined && activity.awayScore !== undefined 
            ? `${activity.homeScore} - ${activity.awayScore}` 
            : "Inget resultat"}
        </div>
        {activity.isWin === true && (
          <Badge variant="success">Vinst</Badge>
        )}
        {activity.isWin === false && (
          <Badge variant="destructive">Förlust</Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1">
          <Input
            type="number"
            min="0"
            value={homeScore !== undefined ? homeScore : ""}
            onChange={(e) => {
              const val = e.target.value === "" ? undefined : parseInt(e.target.value);
              setHomeScore(val);
            }}
            placeholder="Hemma"
            className="w-16 text-center"
            disabled={isSaving || isReadOnly}
          />
          <span className="text-lg font-semibold mx-1">-</span>
          <Input
            type="number"
            min="0"
            value={awayScore !== undefined ? awayScore : ""}
            onChange={(e) => {
              const val = e.target.value === "" ? undefined : parseInt(e.target.value);
              setAwayScore(val);
            }}
            placeholder="Borta"
            className="w-16 text-center"
            disabled={isSaving || isReadOnly}
          />
        </div>
        <Button
          onClick={handleSave}
          size="sm"
          disabled={!hasChanges || isSaving || isReadOnly}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : justSaved ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            "Spara"
          )}
        </Button>
      </div>
    </div>
  );
}

// Fix missing Badge import
import { Badge } from "@/components/ui/badge";
