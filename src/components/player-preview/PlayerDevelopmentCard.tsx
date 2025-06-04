
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player } from "@/types/player";
import { BarChart3 } from "lucide-react";
import { DevelopmentChart } from "@/components/player-detail/DevelopmentChart";

interface PlayerDevelopmentCardProps {
  player: Player;
}

export function PlayerDevelopmentCard({ player }: PlayerDevelopmentCardProps) {
  if (!player.development) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Utveckling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Ingen utvecklingsdata tillgänglig
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Utveckling
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DevelopmentChart 
          development={player.development} 
          className="h-[250px]" 
          minimal={true}
        />
      </CardContent>
    </Card>
  );
}
