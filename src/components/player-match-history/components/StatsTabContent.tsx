
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star } from "lucide-react";
import { calculatePlayerStats } from '../utils/stats-calculator';

interface StatsTabContentProps {
  player: Player;
  matches: Activity[];
}

export function StatsTabContent({ player, matches }: StatsTabContentProps) {
  const { 
    totalGoals, totalAssists, 
    matchesWithGoals, matchesWithAssists,
    wins, draws, losses
  } = calculatePlayerStats(player, matches);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center">
            <Trophy className="h-4 w-4 mr-2 text-amber-500" />
            Mål & Assist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt>Matcher:</dt>
              <dd>{matches.length}</dd>
            </div>
            <div className="flex justify-between font-medium">
              <dt>Mål:</dt>
              <dd>{totalGoals}</dd>
            </div>
            <div className="flex justify-between font-medium">
              <dt>Assist:</dt>
              <dd>{totalAssists}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground text-sm">
              <dt>Mål per match:</dt>
              <dd>{matches.length > 0 ? (totalGoals / matches.length).toFixed(1) : "0"}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground text-sm">
              <dt>Assist per match:</dt>
              <dd>{matches.length > 0 ? (totalAssists / matches.length).toFixed(1) : "0"}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground text-sm">
              <dt>Matcher med mål:</dt>
              <dd>{matchesWithGoals} ({matches.length > 0 ? Math.round((matchesWithGoals / matches.length) * 100) : 0}%)</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center">
            <Star className="h-4 w-4 mr-2 text-blue-500" />
            Resultat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt>Matcher:</dt>
              <dd>{matches.length}</dd>
            </div>
            <div className="flex justify-between font-medium text-green-600">
              <dt>Vinster:</dt>
              <dd>{wins}</dd>
            </div>
            <div className="flex justify-between font-medium text-amber-600">
              <dt>Oavgjorda:</dt>
              <dd>{draws}</dd>
            </div>
            <div className="flex justify-between font-medium text-red-600">
              <dt>Förluster:</dt>
              <dd>{losses}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground text-sm">
              <dt>Vinstprocent:</dt>
              <dd>{matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0}%</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
