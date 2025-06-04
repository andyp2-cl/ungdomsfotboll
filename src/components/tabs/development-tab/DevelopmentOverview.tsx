import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Player, Activity, PlayerDevelopment } from "@/types/player";
import { DevelopmentChart } from "@/components/player-detail/DevelopmentChart";
import { DevelopmentTrendChart } from "@/components/development-tracking/DevelopmentTrendChart";
import { DevelopmentHeatmap } from "@/components/development-tracking/DevelopmentHeatmap";
import { DevelopmentInsightsCard } from "@/components/development-tracking/DevelopmentInsightsCard";
import { QuickActionsCard } from "@/components/development-tracking/QuickActionsCard";
import { useDevelopmentHistory } from "@/hooks/useDevelopmentHistory";
import { TrendingUp, Users, Trophy, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DevelopmentOverviewProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
  onTabChange?: (tab: string) => void;
}

export function DevelopmentOverview({
  players,
  activities,
  onPlayerSelect,
  onTabChange
}: DevelopmentOverviewProps) {
  const { toast } = useToast();
  
  // Filter out trainers
  const activePlayers = players.filter(player => 
    !player.positions?.includes("TRÄNARE")
  );

  // Calculate team development average
  const teamDevelopmentAverage = useMemo(() => {
    if (activePlayers.length === 0) return null;

    const defaultDevelopment: PlayerDevelopment = {
      technical: 1,
      gameUnderstanding: 1,
      passing: 1,
      offensive: 1,
      defensive: 1,
      mentality: 1,
      shooting: 1,
      crossing: 1,
      finishing: 1,
      creativity: 1,
      tackling: 1,
      interception: 1,
      positioning: 1,
      heading: 1,
      speed: 1,
      stamina: 1,
      strength: 1,
      leadership: 1,
      composure: 1,
      workRate: 1
    };

    const totals = activePlayers.reduce((acc, player) => {
      const dev = player.development || defaultDevelopment;
      Object.keys(defaultDevelopment).forEach(key => {
        const typedKey = key as keyof PlayerDevelopment;
        acc[typedKey] += dev[typedKey] || 1;
      });
      return acc;
    }, { ...defaultDevelopment });

    Object.keys(totals).forEach(key => {
      const typedKey = key as keyof PlayerDevelopment;
      totals[typedKey] = Math.round((totals[typedKey] / activePlayers.length) * 10) / 10;
    });

    return totals;
  }, [activePlayers]);

  // Calculate development trend (simulated data - in real app would come from development history)
  const developmentTrend = useMemo(() => {
    const currentDate = new Date();
    const trendData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const period = date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' });
      
      // Simulate gradual improvement over time
      const baseImprovement = (5 - i) * 0.1;
      
      trendData.push({
        period,
        average: Math.min(10, (teamDevelopmentAverage?.technical || 5) + baseImprovement),
        technical: Math.min(10, (teamDevelopmentAverage?.technical || 5) + baseImprovement + Math.random() * 0.2),
        offensive: Math.min(10, (teamDevelopmentAverage?.offensive || 5) + baseImprovement + Math.random() * 0.2),
        defensive: Math.min(10, (teamDevelopmentAverage?.defensive || 5) + baseImprovement + Math.random() * 0.2),
      });
    }
    
    return trendData;
  }, [teamDevelopmentAverage]);

  // Calculate actual development trend percentage
  const developmentTrendPercentage = useMemo(() => {
    if (developmentTrend.length < 2) return 0;
    
    const latest = developmentTrend[developmentTrend.length - 1];
    const previous = developmentTrend[developmentTrend.length - 2];
    
    const change = ((latest.average - previous.average) / previous.average) * 100;
    return Math.round(change * 10) / 10;
  }, [developmentTrend]);

  // Calculate improvement heatmap data
  const improvementData = useMemo(() => {
    const categories = [
      { key: 'technical', label: 'Teknik' },
      { key: 'offensive', label: 'Offensiv' },
      { key: 'defensive', label: 'Defensiv' },
      { key: 'mentality', label: 'Mentalitet' },
      { key: 'passing', label: 'Passning' },
      { key: 'gameUnderstanding', label: 'Spelförståelse' }
    ];

    return categories.map(category => {
      // Simulate improvement calculation
      const improvement = (Math.random() - 0.3) * 1.5; // Random between -0.45 and 1.2
      const playerCount = Math.floor(Math.random() * activePlayers.length) + 1;
      
      return {
        category: category.label,
        improvement: Math.round(improvement * 10) / 10,
        playerCount
      };
    });
  }, [activePlayers.length]);

  // Calculate insights
  const insights = useMemo(() => {
    // Simulate star players (players with highest average development)
    const starPlayers = activePlayers
      .filter(p => p.development)
      .sort((a, b) => {
        const avgA = Object.values(a.development!).reduce((sum, val) => sum + val, 0) / Object.values(a.development!).length;
        const avgB = Object.values(b.development!).reduce((sum, val) => sum + val, 0) / Object.values(b.development!).length;
        return avgB - avgA;
      })
      .slice(0, 5);

    // Simulate potential talents (random selection for demo)
    const potentialTalents = activePlayers
      .filter(p => !starPlayers.includes(p))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const improvementAreas = improvementData
      .filter(item => item.improvement < 0)
      .map(item => `${item.category} behöver förbättring (${item.improvement} i snitt)`)
      .slice(0, 3);

    const recommendations = [
      "Fokusera på defensiv träning - lägst genomsnittsvärde i laget",
      "Fortsätt utveckla tekniska färdigheter - stark grund att bygga på",
      "Överväg individuell mentalträning för yngre spelare"
    ];

    return {
      starPlayers,
      improvementAreas,
      potentialTalents,
      recommendations
    };
  }, [activePlayers, improvementData]);

  const handleQuickAction = (action: string) => {
    console.log("Quick action:", action);
    
    switch (action) {
      case "set-goals":
        toast({
          title: "Utvecklingsmål",
          description: "Funktionen för att sätta utvecklingsmål kommer snart. Använd individuell vy för att se spelarnas nuvarande utveckling.",
        });
        break;
      case "filter-by-grade":
        toast({
          title: "Filtrera per nivå",
          description: "Gå till individuell vy för att filtrera spelare per nivå och se deras utveckling.",
        });
        // Navigate to individual tab where filtering is available
        onTabChange?.("individual");
        break;
      default:
        console.log("Unhandled action:", action);
    }
  };

  const getKPIColor = (value: number, type: 'percentage' | 'score' | 'trend') => {
    if (type === 'percentage') {
      if (value >= 80) return "text-green-600";
      if (value >= 60) return "text-yellow-600";
      return "text-red-600";
    }
    if (type === 'score') {
      if (value >= 7) return "text-green-600";
      if (value >= 5) return "text-yellow-600";
      return "text-red-600";
    }
    if (type === 'trend') {
      if (value > 0) return "text-green-600";
      if (value === 0) return "text-gray-600";
      return "text-red-600";
    }
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Enhanced KPI Section with color coding */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiva Spelare</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlayers.length}</div>
            <p className="text-xs text-muted-foreground">
              Med utvecklingsdata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Senaste Aktiviteter</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">
              Totalt antal aktiviteter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genomsnitt Teknik</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getKPIColor(teamDevelopmentAverage?.technical || 0, 'score')}`}>
              {teamDevelopmentAverage?.technical.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Laggenomsnitt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utvecklingstrend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getKPIColor(developmentTrendPercentage, 'trend')}`}>
              {developmentTrendPercentage > 0 ? '+' : ''}{developmentTrendPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              Senaste månaden
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Development Trend Chart */}
      <DevelopmentTrendChart trendData={developmentTrend} />

      {/* Development Heatmap and Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <DevelopmentHeatmap improvementData={improvementData} />
        <DevelopmentInsightsCard 
          insights={insights}
          onPlayerSelect={onPlayerSelect}
        />
      </div>

      {/* Team Development Chart */}
      {teamDevelopmentAverage && (
        <Card>
          <CardHeader>
            <CardTitle>Laggenomsnitt - Utveckling</CardTitle>
          </CardHeader>
          <CardContent>
            <DevelopmentChart 
              development={teamDevelopmentAverage} 
              className="h-[450px]" 
              minimal={true}
              hideAllLabels={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <QuickActionsCard 
        onActionClick={handleQuickAction}
        onTabChange={onTabChange}
      />
    </div>
  );
}
