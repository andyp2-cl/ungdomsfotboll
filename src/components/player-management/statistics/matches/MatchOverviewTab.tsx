
import React from "react";
import { Activity, Player } from "@/types/player";
import { MatchStatsCard } from "./MatchStatsCard";
import { MatchResultChart } from "./MatchResultChart";
import { DetailedMatchStats } from "./DetailedMatchStats";
import { RecentFormCard } from "./RecentFormCard";
import { RecentMatchesList } from "./RecentMatchesList";

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
          onPlayerSelect={undefined}
          className="col-span-1"
        />
      </div>

      <RecentFormCard 
        recentForm={recentForm}
        onActivitySelect={onActivitySelect}
      />

      <RecentMatchesList 
        historicalMatchActivities={historicalMatchActivities}
        onActivitySelect={onActivitySelect}
      />
    </div>
  );
}
