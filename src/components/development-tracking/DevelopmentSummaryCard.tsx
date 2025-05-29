
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp } from "lucide-react";
import { PlayerDevelopment } from "@/types/player";
import { DevelopmentChangeIndicator } from "./DevelopmentChangeIndicator";

interface DevelopmentSummaryCardProps {
  playerName: string;
  current?: PlayerDevelopment;
  previous?: PlayerDevelopment;
  lastUpdated?: string;
  className?: string;
}

export function DevelopmentSummaryCard({
  playerName,
  current,
  previous,
  lastUpdated,
  className = ""
}: DevelopmentSummaryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Utvecklingssammanfattning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <DevelopmentChangeIndicator current={current} previous={previous} />
        </div>
        
        {lastUpdated && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Senast uppdaterad:</span>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              {formatDate(lastUpdated)}
            </div>
          </div>
        )}

        {current && previous && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Genomsnitt nu</div>
              <div className="text-sm font-medium">
                {(Object.values(current).reduce((a, b) => a + b, 0) / Object.values(current).length).toFixed(1)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Genomsnitt förut</div>
              <div className="text-sm font-medium">
                {(Object.values(previous).reduce((a, b) => a + b, 0) / Object.values(previous).length).toFixed(1)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
