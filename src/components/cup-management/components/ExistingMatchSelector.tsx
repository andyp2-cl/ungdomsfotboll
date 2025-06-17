import React from "react";
import { Activity } from "@/types/player";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { isSameMonth } from "date-fns";

interface ExistingMatchSelectorProps {
  cupActivity: Activity;
  availableMatches: Activity[];
  selectedMatchIds: string[];
  onMatchSelect: (matchId: string, isSelected: boolean) => void;
}

export function ExistingMatchSelector({
  cupActivity,
  availableMatches,
  selectedMatchIds,
  onMatchSelect,
}: ExistingMatchSelectorProps) {
  // Filter matches to only show those from the same month as the cup
  const cupDate = new Date(cupActivity.date);
  const matchesInSameMonth = availableMatches.filter(match => {
    const matchDate = new Date(match.date);
    return isSameMonth(cupDate, matchDate);
  });

  if (matchesInSameMonth.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Inga matcher hittades för samma månad som cupen.
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[400px] pr-2">
      <div className="space-y-2">
        {matchesInSameMonth.map((match) => (
          <Card key={match.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`match-${match.id}`}
                  checked={selectedMatchIds.includes(match.id)}
                  onCheckedChange={(checked) => onMatchSelect(match.id, checked === true)}
                />
                <div className="flex-grow">
                  <label
                    htmlFor={`match-${match.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {match.name}
                  </label>
                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    {match.time && (
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {match.time}
                      </span>
                    )}
                    {match.location?.name && (
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {match.location.name}
                      </span>
                    )}
                    {match.result && (
                      <Badge variant={match.isWin ? "success" : "destructive"}>
                        {match.result}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
} 