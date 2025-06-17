import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity } from "@/types/player";
import { CupMatch } from "../types";
import { MatchFormList } from "./MatchFormList";
import { ExistingMatchSelector } from "./ExistingMatchSelector";

interface MatchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cupName: string;
  cupDate?: string;
  cupLocation?: string;
  cupActivity: Activity;
  availableMatches: Activity[];
  newMatches: CupMatch[];
  onAddMatch: () => void;
  updateMatch: (index: number, field: keyof CupMatch, value: string | number | undefined) => void;
  removeMatch: (index: number) => void;
  handleSubmit: () => Promise<void>;
  onExistingMatchesSubmit: (matchIds: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export function MatchDialog({
  isOpen,
  onOpenChange,
  cupName,
  cupDate,
  cupLocation,
  cupActivity,
  availableMatches,
  newMatches,
  onAddMatch,
  updateMatch,
  removeMatch,
  handleSubmit,
  onExistingMatchesSubmit,
  isSubmitting
}: MatchDialogProps) {
  const [selectedTab, setSelectedTab] = useState<"new" | "existing">("existing");
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);

  const handleMatchSelect = (matchId: string, isSelected: boolean) => {
    setSelectedMatchIds(prev => 
      isSelected 
        ? [...prev, matchId]
        : prev.filter(id => id !== matchId)
    );
  };

  const handleExistingMatchesSubmit = async () => {
    if (selectedMatchIds.length === 0) return;
    await onExistingMatchesSubmit(selectedMatchIds);
    setSelectedMatchIds([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Lägg till matcher i {cupName}</DialogTitle>
          {(cupDate || cupLocation) && (
            <div className="text-sm text-muted-foreground mt-1">
              {cupDate && <div>Datum: {cupDate}</div>}
              {cupLocation && <div>Plats: {cupLocation}</div>}
            </div>
          )}
        </DialogHeader>
        
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as "new" | "existing")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Välj befintliga</TabsTrigger>
            <TabsTrigger value="new">Skapa nya</TabsTrigger>
          </TabsList>
          
          <TabsContent value="existing" className="mt-4">
            <ExistingMatchSelector
              cupActivity={cupActivity}
              availableMatches={availableMatches}
              selectedMatchIds={selectedMatchIds}
              onMatchSelect={handleMatchSelect}
            />
          </TabsContent>
          
          <TabsContent value="new" className="mt-4">
            <ScrollArea className="max-h-[60vh] pr-3">
              <MatchFormList
                matches={newMatches}
                onAddMatch={onAddMatch}
                updateMatch={updateMatch}
                removeMatch={removeMatch}
                showOnlyNameAndScore={true}
              />
              <p className="text-xs italic mt-2">
                Nya matcher kommer att ärva cupens datum och plats.
              </p>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Avbryt
          </Button>
          {selectedTab === "existing" ? (
            <Button
              onClick={handleExistingMatchesSubmit}
              disabled={selectedMatchIds.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Sparar..." : `Lägg till ${selectedMatchIds.length} matcher`}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={newMatches.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Sparar..." : `Lägg till ${newMatches.length} matcher`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
