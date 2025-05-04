import React from "react";
import { Activity } from "@/types/player";
import { Edit, Save } from "lucide-react";
import { useState } from "react";
import { extractTeamNames } from "./utils/team-detection";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SimpleResultViewProps {
  activity: Activity;
  onMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
}

export function SimpleResultView({ activity, onMatchResultUpdate }: SimpleResultViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const teamNames = extractTeamNames(activity);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onMatchResultUpdate) {
        const success = await onMatchResultUpdate(activity.id, homeScore, awayScore);
        if (success) {
          toast({
            title: "Matchresultat sparat",
            description: "Matchresultatet har sparats framgångsrikt.",
          });
          setIsEditing(false);
        } else {
          toast({
            title: "Ett fel uppstod",
            description: "Kunde inte spara resultat. Försök igen.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error saving match result:", error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte spara resultat. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {isEditing ? (
        <>
          <Input
            type="number"
            placeholder="Hemma"
            value={homeScore === undefined ? "" : homeScore.toString()}
            onChange={(e) => setHomeScore(e.target.value === "" ? undefined : Number(e.target.value))}
            className="w-20"
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="Borta"
            value={awayScore === undefined ? "" : awayScore.toString()}
            onChange={(e) => setAwayScore(e.target.value === "" ? undefined : Number(e.target.value))}
            className="w-20"
          />
          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Sparar...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Spara
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="text-lg font-semibold">
            {activity.homeScore !== undefined && activity.awayScore !== undefined
              ? `${activity.homeScore} - ${activity.awayScore}`
              : "Inga resultat"}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Redigera
          </Button>
        </>
      )}
    </div>
  );
}
