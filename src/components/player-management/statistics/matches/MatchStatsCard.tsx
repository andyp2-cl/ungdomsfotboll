
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MatchStatsCardProps {
  matchStats: {
    total: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    cleanSheets: number;
    comebackWins: number;
  };
}

export function MatchStatsCard({ matchStats }: MatchStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detaljerad matchstatistik</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <DetailedStatItem 
            label="Totalt antal matcher:" 
            value={matchStats.total} 
            className="bg-muted"
          />
          <DetailedStatItem 
            label="Vinster:" 
            value={matchStats.wins} 
            className="bg-green-100 text-green-800" 
          />
          <DetailedStatItem 
            label="Oavgjorda:" 
            value={matchStats.draws} 
            className="bg-gray-100 text-gray-800" 
          />
          <DetailedStatItem 
            label="Förluster:" 
            value={matchStats.losses} 
            className="bg-red-100 text-red-800" 
          />
          <DetailedStatItem 
            label="Gjorda mål:" 
            value={matchStats.goalsScored} 
            className="bg-blue-100 text-blue-800" 
          />
          <DetailedStatItem 
            label="Hållna nollor:" 
            value={matchStats.cleanSheets} 
            className="bg-emerald-100 text-emerald-800" 
          />
          <DetailedStatItem 
            label="Comeback-vinster:" 
            value={matchStats.comebackWins} 
            className="bg-purple-100 text-purple-800" 
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface DetailedStatItemProps {
  label: string;
  value: number;
  className?: string;
}

function DetailedStatItem({ label, value, className = "" }: DetailedStatItemProps) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-md ${className}`}>
      <span className="font-medium">{label}</span>
      <span>{value}</span>
    </div>
  );
}
