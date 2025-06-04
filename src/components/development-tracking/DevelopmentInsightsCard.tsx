
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Target, AlertCircle, CheckCircle } from "lucide-react";
import { Player } from "@/types/player";

interface DevelopmentInsightsCardProps {
  insights: {
    starPlayers: Player[];
    improvementAreas: string[];
    potentialTalents: Player[];
    recommendations: string[];
  };
  onPlayerSelect?: (playerId: string) => void;
  className?: string;
}

export function DevelopmentInsightsCard({ 
  insights, 
  onPlayerSelect, 
  className = "" 
}: DevelopmentInsightsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Utvecklingsinsikter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Players */}
        <div>
          <h4 className="flex items-center gap-2 font-medium mb-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Stjärnspelare
          </h4>
          <div className="flex flex-wrap gap-2">
            {insights.starPlayers.slice(0, 3).map((player) => (
              <Badge 
                key={player.id}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => onPlayerSelect?.(player.id)}
              >
                {player.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Potential Talents */}
        <div>
          <h4 className="flex items-center gap-2 font-medium mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Potentiella talanger
          </h4>
          <div className="flex flex-wrap gap-2">
            {insights.potentialTalents.slice(0, 3).map((player) => (
              <Badge 
                key={player.id}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => onPlayerSelect?.(player.id)}
              >
                {player.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Improvement Areas */}
        <div>
          <h4 className="flex items-center gap-2 font-medium mb-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            Förbättringsområden
          </h4>
          <div className="space-y-1">
            {insights.improvementAreas.slice(0, 2).map((area, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                • {area}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-medium mb-2">Rekommendationer</h4>
          <div className="space-y-1">
            {insights.recommendations.slice(0, 2).map((rec, index) => (
              <div key={index} className="text-sm p-2 bg-blue-50 border border-blue-200 rounded">
                {rec}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
