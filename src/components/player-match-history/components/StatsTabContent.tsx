
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePlayerStats } from "../utils/stats-calculator";

interface StatsTabContentProps {
  player: Player;
  activities: Activity[];
}

export function StatsTabContent({ player, activities }: StatsTabContentProps) {
  const stats = calculatePlayerStats(player, activities);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Matcher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Spelade</span>
              <span className="font-medium">{stats.matches}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vinster</span>
              <span className="font-medium">{stats.wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Förluster</span>
              <span className="font-medium">{stats.losses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Oavgjorda</span>
              <span className="font-medium">{stats.draws}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Mål & Assist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mål</span>
              <span className="font-medium">{stats.goals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assist</span>
              <span className="font-medium">{stats.assists}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mål per match</span>
              <span className="font-medium">
                {stats.matches > 0 
                  ? (stats.goals / stats.matches).toFixed(2) 
                  : '0.00'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
