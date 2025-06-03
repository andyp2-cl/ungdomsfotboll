
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, Save, History } from "lucide-react";
import { PlayerDevelopment } from "@/types/player";
import { useDevelopmentHistory } from "@/hooks/useDevelopmentHistory";
import { useToast } from "@/hooks/use-toast";

interface DevelopmentHistoryButtonProps {
  playerId: string;
  playerName: string;
  currentDevelopment: PlayerDevelopment;
  previousDevelopment?: PlayerDevelopment;
}

export function DevelopmentHistoryButton({
  playerId,
  playerName,
  currentDevelopment,
  previousDevelopment
}: DevelopmentHistoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { addManualHistoryEntry, hasSignificantChange } = useDevelopmentHistory();
  const { toast } = useToast();

  // Kontrollera om det finns betydande förändringar
  const hasChanges = previousDevelopment ? 
    hasSignificantChange(currentDevelopment, previousDevelopment) : true;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await addManualHistoryEntry(
        playerId, 
        currentDevelopment, 
        notes || `Manuell sparning för ${playerName}`
      );
      toast({
        title: "Utvecklingshistorik sparad",
        description: `Utvecklingsdata för ${playerName} har sparats manuellt.`,
      });
      setNotes("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving development history:", error);
      toast({
        title: "Fel vid sparning",
        description: "Kunde inte spara utvecklingshistoriken. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          Spara utveckling manuellt
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Spara utvecklingshistorik - {playerName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Visar om det finns betydande förändringar */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">
              {hasChanges ? (
                <span className="text-green-600 font-medium">
                  ✓ Betydande förändringar upptäckta
                </span>
              ) : (
                <span className="text-yellow-600 font-medium">
                  ⚠ Inga stora förändringar (mindre än 0.5 poäng skillnad)
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Du kan ändå spara manuellt för att markera en viktig tidpunkt.
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Anteckningar (valfritt)</Label>
            <Textarea
              id="notes"
              placeholder="Beskriv vad som lett till denna utveckling, t.ex. 'Efter intensiv träningsperiod' eller 'Genombrott i matchspel'..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Sparar..." : "Spara utvecklingshistorik"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
