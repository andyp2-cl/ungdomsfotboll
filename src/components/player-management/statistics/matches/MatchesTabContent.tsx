
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailedMatchStats } from "./DetailedMatchStats";
import { MatchStatsCard } from "./MatchStatsCard";
import { MatchResultChart } from "./MatchResultChart";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy } from "lucide-react";

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
  const [selectedView, setSelectedView] = useState<"overview" | "home-away" | "history">("overview");

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
      // Determine if this is a home or away match based on match name or other indicators
      // For now, we'll split them roughly evenly or use a heuristic
      const isHome = match.name?.toLowerCase().includes('hemma') || 
                     Math.random() > 0.5; // Placeholder logic
      
      const stats = isHome ? home : away;
      stats.matches++;
      stats.goals += match.homeScore || 0;
      stats.conceded += match.awayScore || 0;
      
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

  // Calculate recent form (last 10 matches)
  const recentForm = React.useMemo(() => {
    return historicalMatchActivities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="home-away">Hemma/Borta</TabsTrigger>
          <TabsTrigger value="history">Matchhistorik</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MatchStatsCard 
              activities={historicalMatchActivities} 
              className="col-span-1"
            />
            
            <MatchResultChart 
              matchStats={matchStats}
            />
            
            <DetailedMatchStats 
              activities={historicalMatchActivities}
              players={players}
              onActivitySelect={onActivitySelect}
              onPlayerSelect={undefined}
              className="col-span-1"
            />
          </div>

          {/* Recent Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Senaste formen (10 matcher)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {recentForm.map((match, index) => (
                  <div
                    key={match.id}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform ${
                      match.result === 'W' 
                        ? 'bg-green-500' 
                        : match.result === 'L' 
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                    }`}
                    title={`${match.name} - ${formatDate(match.date)}`}
                    onClick={() => onActivitySelect?.(match)}
                  >
                    {match.result}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="home-away" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Hemmastatistik</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Matcher</span>
                    <span className="font-bold">{homeStats.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vinster</span>
                    <span className="font-bold text-green-600">{homeStats.wins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Oavgjorda</span>
                    <span className="font-bold text-yellow-600">{homeStats.draws}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Förluster</span>
                    <span className="font-bold text-red-600">{homeStats.losses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mål gjorda</span>
                    <span className="font-bold">{homeStats.goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mål insläppta</span>
                    <span className="font-bold">{homeStats.conceded}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Vinstprocent</span>
                    <span className="font-bold text-green-600">
                      {homeStats.matches > 0 ? Math.round((homeStats.wins / homeStats.matches) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Bortastatistik</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Matcher</span>
                    <span className="font-bold">{awayStats.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vinster</span>
                    <span className="font-bold text-green-600">{awayStats.wins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Oavgjorda</span>
                    <span className="font-bold text-yellow-600">{awayStats.draws}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Förluster</span>
                    <span className="font-bold text-red-600">{awayStats.losses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mål gjorda</span>
                    <span className="font-bold">{awayStats.goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mål insläppta</span>
                    <span className="font-bold">{awayStats.conceded}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Vinstprocent</span>
                    <span className="font-bold text-blue-600">
                      {awayStats.matches > 0 ? Math.round((awayStats.wins / awayStats.matches) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Komplett matchhistorik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historicalMatchActivities
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(match => (
                    <div 
                      key={match.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 cursor-pointer transition-colors"
                      onClick={() => onActivitySelect?.(match)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{match.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(match.date)}
                          {match.location_name && (
                            <>
                              <MapPin className="h-3 w-3" />
                              {match.location_name}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {match.homeScore !== undefined && match.awayScore !== undefined && (
                          <Badge variant="outline" className="font-mono">
                            {match.homeScore}-{match.awayScore}
                          </Badge>
                        )}
                        <Badge 
                          variant={match.isWin === true ? "default" : match.isWin === false ? "destructive" : "secondary"}
                        >
                          {match.isWin === true ? "Vinst" : match.isWin === false ? "Förlust" : "Oavgjort"}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
