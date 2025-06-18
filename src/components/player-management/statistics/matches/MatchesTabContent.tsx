import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchOverviewTab } from "./MatchOverviewTab";
import { HomeAwayTab } from "./HomeAwayTab";

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
  const [selectedView, setSelectedView] = useState<"overview" | "home-away">("overview");

  // Filter match activities to only include historical matches (date is in the past)
  const historicalMatchActivities = activities.filter(activity => {
    if (activity.type !== "match") return false;
    
    const activityDate = new Date(activity.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return activityDate < today;
  });

  // Calculate home vs away statistics
  const { homeStats, awayStats } = React.useMemo(() => {
    const home = { matches: 0, wins: 0, draws: 0, losses: 0, goals: 0, conceded: 0 };
    const away = { matches: 0, wins: 0, draws: 0, losses: 0, goals: 0, conceded: 0 };

    historicalMatchActivities.forEach(match => {
      const isHome = match.homeTeam?.toLowerCase().includes('hässleholms if');
      const stats = isHome ? home : away;
      stats.matches++;
      
      // Calculate goals based on home/away status
      if (isHome) {
        stats.goals += match.homeScore || 0;
        stats.conceded += match.awayScore || 0;
      } else {
        stats.goals += match.awayScore || 0;
        stats.conceded += match.homeScore || 0;
      }
      
      if (match.homeScore === match.awayScore) {
        stats.draws++;
      } else if (match.isWin === true) {
        stats.wins++;
      } else if (match.isWin === false) {
        stats.losses++;
      }
    });

    return { homeStats: home, awayStats: away };
  }, [historicalMatchActivities]);

  // Calculate recent form (last 5 matches)
  const recentForm = React.useMemo(() => {
    return historicalMatchActivities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(match => ({
        ...match,
        result: match.isWin === true ? 'W' : match.isWin === false ? 'L' : 'D'
      }));
  }, [historicalMatchActivities]);

  // Calculate overall match statistics
  const matchStats = React.useMemo(() => {
    const stats = {
      total: historicalMatchActivities.length,
      wins: historicalMatchActivities.filter(a => a.isWin === true).length,
      draws: historicalMatchActivities.filter(a => a.homeScore === a.awayScore).length,
      losses: historicalMatchActivities.filter(a => a.isWin === false && a.homeScore !== a.awayScore).length
    };
    return stats;
  }, [historicalMatchActivities]);

  return (
    <div className="space-y-6">
      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="home-away">Hemma/Borta</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <MatchOverviewTab
            historicalMatchActivities={historicalMatchActivities}
            players={players}
            matchStats={matchStats}
            recentForm={recentForm}
            onActivitySelect={onActivitySelect}
            onPlayerSelect={onPlayerSelect}
          />
        </TabsContent>

        <TabsContent value="home-away">
          <HomeAwayTab
            homeStats={homeStats}
            awayStats={awayStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
