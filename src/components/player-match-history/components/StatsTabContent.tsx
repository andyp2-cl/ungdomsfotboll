
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { calculatePlayerStats } from '../utils/stats-calculator';

interface StatsTabContentProps {
  player: Player;
  matches: Activity[];
}

export function StatsTabContent({ player, matches }: StatsTabContentProps) {
  const stats = calculatePlayerStats(player, matches);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Allmän statistik</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Antal matcher</span>
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
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Mål statistik</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Totalt mål</span>
              <span className="font-medium">{stats.totalGoals}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Totalt assist</span>
              <span className="font-medium">{stats.totalAssists}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mål per match</span>
              <span className="font-medium">
                {stats.matches > 0 ? (stats.totalGoals / stats.matches).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
