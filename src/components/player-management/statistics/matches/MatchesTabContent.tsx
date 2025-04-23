
import React from "react";
import { Activity, Player } from "@/types/player";
import { Card } from "@/components/ui/card";
import { DetailedMatchStats } from "./DetailedMatchStats";
import { MatchStatsCard } from "./MatchStatsCard";

interface MatchesTabContentProps {
  activities: Activity[];
  players: Player[];
  onActivitySelect?: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function MatchesTabContent({ 
  activities, 
  players,
  onActivitySelect,
  onPlayerSelect 
}: MatchesTabContentProps) {
  const matchActivities = activities.filter(activity => activity.type === "match");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MatchStatsCard 
        activities={matchActivities} 
        className="col-span-full md:col-span-1"
      />
      
      <DetailedMatchStats 
        activities={matchActivities}
        players={players}
        onActivitySelect={onActivitySelect}
        onPlayerSelect={onPlayerSelect}
        className="col-span-full md:col-span-1"
      />
    </div>
  );
}
