
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface LeagueInfo {
  id: string;
  name: string;
  division: string;
  year: number;
}

interface LeaguesStatsCardProps {
  player: Player;
  activities: Activity[];
  className?: string;
}

export function LeaguesStatsCard({ player, activities, className }: LeaguesStatsCardProps) {
  // Fetch all leagues to get their names
  const { data: leaguesInfo = [] } = useQuery({
    queryKey: ["leagues-info"],
    queryFn: async (): Promise<LeagueInfo[]> => {
      const { data, error } = await supabase
        .from("leagues")
        .select("*");
      
      if (error) {
        console.error("Error fetching leagues info:", error);
        return [];
      }
      
      return data || [];
    },
  });

  const getLeagueMatches = (leagueId: string) => {
    return activities.filter(activity => 
      activity.participants?.includes(player.id) && 
      activity.type === "match" &&
      (activity.leagueId === leagueId || activity.league_id === leagueId)
    ).length;
  };

  // Get unique league IDs for this player
  const leagueIds = activities
    .filter(activity => 
      activity.participants?.includes(player.id) && 
      activity.type === "match" && 
      (activity.leagueId || activity.league_id)
    )
    .map(activity => activity.leagueId || activity.league_id)
    .filter((value, index, self) => value && self.indexOf(value) === index);

  // Get league name from the ID using the fetched leagues info
  const getLeagueName = (leagueId: string): string => {
    const league = leaguesInfo.find(l => l.id === leagueId);
    if (league) {
      // Format the league name properly without year duplication
      const yearStr = league.year.toString();
      let cleanName = league.name;
      
      // Remove year prefix if it duplicates the year
      if (cleanName.startsWith(yearStr)) {
        cleanName = cleanName.replace(new RegExp(`^${yearStr}\\s+${yearStr}\\s+`), '');
        cleanName = cleanName.replace(new RegExp(`^${yearStr}\\s+`), '');
      }
      
      return `${league.year} ${cleanName}`;
    }
    return `Liga ${leagueIds.indexOf(leagueId) + 1}`;
  };

  // Custom sort function for leagues
  const sortLeagues = (leagueIds: (string | undefined)[]) => {
    const leagueInfoMap = new Map<string, LeagueInfo>();
    
    // Create a map of league id to league info
    leagueIds.forEach(id => {
      if (id) {
        const league = leaguesInfo.find(l => l.id === id);
        if (league) {
          leagueInfoMap.set(id, league);
        }
      }
    });
    
    // Sort leagues according to the custom order
    return [...leagueIds].sort((aId, bId) => {
      const a = leagueInfoMap.get(aId!);
      const b = leagueInfoMap.get(bId!);
      
      if (!a || !b) return 0;
      
      // First sort by year (descending)
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      
      // Custom sort for division A, A2, A1, B1, etc.
      const aDivisionLetter = a.name.charAt(0);
      const bDivisionLetter = b.name.charAt(0);
      
      // If division letters are different, sort alphabetically (A before B)
      if (aDivisionLetter !== bDivisionLetter) {
        return aDivisionLetter.localeCompare(bDivisionLetter);
      }
      
      // If both are A division, handle A, A1, A2 special case
      if (aDivisionLetter === 'A') {
        // Plain "A" always comes first
        if (a.name === 'A' && b.name !== 'A') return -1;
        if (b.name === 'A' && a.name !== 'A') return 1;
        
        // For A1, A2, etc., sort by the number (A2 before A1)
        const aNumber = parseInt(a.name.substring(1), 10) || 0;
        const bNumber = parseInt(b.name.substring(1), 10) || 0;
        
        // Special case: A2 should come before A1
        if (aNumber === 2 && bNumber === 1) return -1;
        if (aNumber === 1 && bNumber === 2) return 1;
        
        return aNumber - bNumber;
      }
      
      // For other divisions, sort normally
      return a.name.localeCompare(b.name);
    });
  };

  // Prepare data for pie chart
  const sortedLeagueIds = sortLeagues(leagueIds);
  const leagueData = sortedLeagueIds.map(leagueId => ({
    leagueId,
    value: getLeagueMatches(leagueId!),
    name: getLeagueName(leagueId!)
  }));

  // Colors for the pie chart segments - using a more visually appealing palette
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // Render pie chart if we have data
  const renderPieChart = () => {
    if (leagueData.length === 0) return null;
    
    return (
      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={leagueData}
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={40}
              paddingAngle={2}
              dataKey="value"
            >
              {leagueData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Ligor</CardTitle>
      </CardHeader>
      <CardContent>
        {leagueIds.length > 0 ? (
          <>
            {renderPieChart()}
            <div className="space-y-2 mt-2">
              {leagueData.map((league, index) => {
                const color = COLORS[index % COLORS.length];
                return (
                  <div key={league.leagueId || index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-muted-foreground">
                        {league.name}:
                      </span>
                    </div>
                    <span className="font-medium">{league.value}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-muted-foreground text-sm">
            Inga ligamatcher registrerade
          </div>
        )}
      </CardContent>
    </Card>
  );
}
