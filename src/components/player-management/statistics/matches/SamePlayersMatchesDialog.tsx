import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity, Player } from "@/types/player";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/utils/formatDate";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportMatchesToExcel } from "@/utils/exportUtils";

interface SamePlayersMatchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matches: Activity[];
  combinations: { participants: string[]; matches: Activity[]; count: number }[];
  players: Player[];
}

export function SamePlayersMatchesDialog({
  open,
  onOpenChange,
  matches,
  combinations,
  players,
}: SamePlayersMatchesDialogProps) {
  const handleExport = () => {
    exportMatchesToExcel(combinations, players);
  };

  // Helper function to get player names from IDs
  const getPlayerNames = (playerIds: string[]) => {
    return playerIds
      .map(id => {
        const player = players.find(p => p.id === id);
        return player ? `${player.name}${player.jerseyNumber ? ` (#${player.jerseyNumber})` : ''}` : id;
      })
      .sort()
      .join(", ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Matcher med samma spelare</DialogTitle>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportera till Excel
          </Button>
        </DialogHeader>
        <ScrollArea className="flex-grow">
          <div className="space-y-4 p-4">
            {combinations.map((combo, index) => (
              <Accordion key={index} type="single" collapsible>
                <AccordionItem value="matches">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{combo.count} matcher</Badge>
                      <span className="text-sm">
                        {combo.participants.map(id => {
                          const player = players.find(p => p.id === id);
                          return player ? player.name : id;
                        }).join(", ")}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {combo.matches.map((match, matchIndex) => (
                        <div
                          key={matchIndex}
                          className="p-2 rounded-md bg-muted flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">{match.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(match.date)}
                            </div>
                          </div>
                          {match.result && (
                            <Badge variant="outline">{match.result}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 