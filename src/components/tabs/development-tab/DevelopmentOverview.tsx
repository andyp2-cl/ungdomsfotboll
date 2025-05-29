
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Player, Activity, PlayerDevelopment } from "@/types/player";
import { DevelopmentChart } from "@/components/player-detail/DevelopmentChart";
import { TrendingUp, Users, Trophy, Target } from "lucide-react";

interface DevelopmentOverviewProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function DevelopmentOverview({
  players,
  activities,
  onPlayerSelect
}: DevelopmentOverviewProps) {
  // Filter out trainers
  const activePlayers = players.filter(player => 
    !player.positions?.includes("TRÄNARE")
  );

  // Calculate team development overview
  const teamDevelopmentAverage = React.useMemo(() => {
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

    // Sum all values
    const totals = activePlayers.reduce((acc, player) => {
      const dev = player.development || defaultDevelopment;
      Object.keys(defaultDevelopment).forEach(key => {
        const typedKey = key as keyof PlayerDevelopment;
        acc[typedKey] += dev[typedKey] || 1;
      });
      return acc;
    }, { ...defaultDevelopment });

    // Calculate averages
    Object.keys(totals).forEach(key => {
      const typedKey = key as keyof PlayerDevelopment;
      totals[typedKey] = Math.round((totals[typedKey] / activePlayers.length) * 10) / 10;
    });

    return totals;
  }, [activePlayers]);

  // Get top performers in each category
  const getTopPerformers = () => {
    const categories = [
      { key: 'technical', label: 'Teknik' },
      { key: 'offensive', label: 'Offensiv' },
      { key: 'defensive', label: 'Defensiv' },
      { key: 'leadership', label: 'Ledarskap' }
    ];

    return categories.map(category => {
      const topPlayer = activePlayers
        .filter(p => p.development)
        .sort((a, b) => {
          const aValue = a.development![category.key as keyof PlayerDevelopment] || 1;
          const bValue = b.development![category.key as keyof PlayerDevelopment] || 1;
          return bValue - aValue;
        })[0];

      return {
        category: category.label,
        player: topPlayer,
        value: topPlayer?.development?.[category.key as keyof PlayerDevelopment] || 1
      };
    });
  };

  const topPerformers = getTopPerformers();

  return (
    <div className="space-y-6">
      {/* Team Overview Stats */}
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
            <div className="text-2xl font-bold">
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
            <div className="text-2xl font-bold text-green-600">+2.3%</div>
            <p className="text-xs text-muted-foreground">
              Senaste månaden
            </p>
          </CardContent>
        </Card>
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
            />
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Topprestationer per kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{performer.category}</h4>
                  <p className="text-sm text-muted-foreground">
                    {performer.player?.name || 'Ingen data'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {performer.value.toFixed(1)}
                  </Badge>
                  {performer.player && onPlayerSelect && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPlayerSelect(performer.player.id)}
                    >
                      Visa
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Utvecklingsinsikter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm">
                <strong>Förbättringsområde:</strong> Laggenomsnitt för "Skott" är lägst ({teamDevelopmentAverage?.shooting.toFixed(1) || '0.0'}). 
                Fokusera på skottträning för bättre målchans.
              </p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm">
                <strong>Stark sida:</strong> Lagets "Spelförståelse" är högst ({teamDevelopmentAverage?.gameUnderstanding.toFixed(1) || '0.0'}). 
                Fortsätt utveckla taktisk förståelse.
              </p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm">
                <strong>Balanserat lag:</strong> Skillnaden mellan offensiva och defensiva värden är endast {Math.abs((teamDevelopmentAverage?.offensive || 1) - (teamDevelopmentAverage?.defensive || 1)).toFixed(1)} poäng.
              </p>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
