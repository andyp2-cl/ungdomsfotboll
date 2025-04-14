
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CupMatch } from "../types";
import { MatchFormList } from "./MatchFormList";

interface MatchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cupName: string;
  newMatches: CupMatch[];
  onAddMatch: () => void;
  updateMatch: (index: number, field: keyof CupMatch, value: string) => void;
  removeMatch: (index: number) => void;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export function MatchDialog({
  isOpen,
  onOpenChange,
  cupName,
  newMatches,
  onAddMatch,
  updateMatch,
  removeMatch,
  handleSubmit,
  isSubmitting
}: MatchDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Lägg till matcher i {cupName}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-3">
          <MatchFormList
            matches={newMatches}
            onAddMatch={onAddMatch}
            updateMatch={updateMatch}
            removeMatch={removeMatch}
          />
        </ScrollArea>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={newMatches.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Sparar..." : `Lägg till ${newMatches.length} matcher`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
