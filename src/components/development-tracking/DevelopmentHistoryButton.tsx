
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, Save } from "lucide-react";
import { PlayerDevelopment } from "@/types/player";
import { useDevelopmentHistory } from "@/hooks/useDevelopmentHistory";
import { useToast } from "@/hooks/use-toast";

interface DevelopmentHistoryButtonProps {
  playerId: string;
  playerName: string;
  currentDevelopment: PlayerDevelopment;
}

export function DevelopmentHistoryButton({
  playerId,
  playerName,
  currentDevelopment
}: DevelopmentHistoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { addHistoryEntry } = useDevelopmentHistory();
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await addHistoryEntry(playerId, currentDevelopment, notes || `Manuell sparning för ${playerName}`);
      toast({
        title: "Utvecklingshistorik sparad",
        description: `Utvecklingsdata för ${playerName} har sparats.`,
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
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Spara utveckling
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Spara utvecklingshistorik - {playerName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="notes">Anteckningar (valfritt)</Label>
            <Textarea
              id="notes"
              placeholder="Lägg till anteckningar om denna utvecklingsuppdatering..."
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
              {isSaving ? "Sparar..." : "Spara"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
