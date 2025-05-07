
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
  // Filter match activities to only include historical matches (date is in the past)
  const historicalMatchActivities = activities.filter(activity => {
    if (activity.type !== "match") return false;
    
    const activityDate = new Date(activity.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    
    return activityDate < today;
  });

  // Handle player selection with proper logging
  const handlePlayerSelect = (playerId: string) => {
    console.log("MatchesTabContent: Player selected:", playerId);
    if (onPlayerSelect) {
      onPlayerSelect(playerId);
    } else {
      console.warn("onPlayerSelect function is not provided to MatchesTabContent");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MatchStatsCard 
        activities={historicalMatchActivities} 
        className="col-span-full md:col-span-1"
      />
      
      <DetailedMatchStats 
        activities={historicalMatchActivities}
        players={players}
        onActivitySelect={onActivitySelect}
        onPlayerSelect={handlePlayerSelect}
        className="col-span-full md:col-span-1"
      />
    </div>
  );
}
