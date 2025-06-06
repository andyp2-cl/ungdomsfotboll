
import React from "react";
import { Activity, Player } from "@/types/player";
import { MatchStatsCard } from "./MatchStatsCard";
import { MatchResultChart } from "./MatchResultChart";
import { DetailedMatchStats } from "./DetailedMatchStats";
import { RecentFormCard } from "./RecentFormCard";
import { HistoricalMatchesTable } from "./HistoricalMatchesTable";

interface MatchOverviewTabProps {
  historicalMatchActivities: Activity[];
  players: Player[];
  matchStats: {
    total: number;
    wins: number;
    draws: number;
    losses: number;
  };
  recentForm: (Activity & { result: string })[];
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function MatchOverviewTab({
  historicalMatchActivities,
  players,
  matchStats,
  recentForm,
  onActivitySelect,
  onPlayerSelect
}: MatchOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MatchStatsCard 
          activities={historicalMatchActivities} 
          className="col-span-1"
        />
        
        <MatchResultChart 
          matchStats={matchStats}
          className="col-span-1"
        />
        
        <DetailedMatchStats 
          activities={historicalMatchActivities}
          players={players}
          onActivitySelect={onActivitySelect}
          onPlayerSelect={onPlayerSelect}
          className="col-span-1"
        />
      </div>

      <RecentFormCard 
        recentForm={recentForm}
        onActivitySelect={onActivitySelect}
      />

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Alla matcher</h3>
        <div className="h-[500px] overflow-hidden">
          <HistoricalMatchesTable 
            historicalMatches={historicalMatchActivities} 
            onActivitySelect={onActivitySelect}
            maxHeight="480px"
          />
        </div>
      </div>
    </div>
  );
}
