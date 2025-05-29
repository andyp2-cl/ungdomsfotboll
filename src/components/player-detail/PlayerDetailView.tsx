
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DevelopmentChart } from "./DevelopmentChart";
import { LeaguesStatsCard } from "./LeaguesStatsCard";
import { calculateWinPercentage } from "@/utils/winCalculation";

interface PlayerDetailViewProps {
  player: Player;
  activities: Activity[];
  className?: string;
}

export function PlayerDetailView({ player, activities, className }: PlayerDetailViewProps) {
  // Calculate statistics
  const playerActivities = activities.filter(activity => 
    activity.participants?.includes(player.id)
  );
  
  const matches = playerActivities.filter(activity => activity.type === "match");
  const cups = playerActivities.filter(activity => activity.type === "cup");
  
  // Use standardized win percentage calculation
  const winPercentage = calculateWinPercentage(matches);

  // Calculate goals and assists from player stats
  let totalGoals = 0;
  let totalAssists = 0;
  let totalGrades = 0;
  let gradeCount = 0;

  matches.forEach(match => {
    if (match.player_stats) {
      // Handle both new and old data structures
      if (match.player_stats[player.id]) {
        const stats = match.player_stats[player.id];
        totalGoals += stats.goals || 0;
        totalAssists += stats.assists || 0;
        if (stats.grade && stats.grade > 0) {
          totalGrades += stats.grade;
          gradeCount++;
        }
      } else if (match.player_stats.goals && match.player_stats.assists) {
        // Handle the newer structure
        totalGoals += match.player_stats.goals[player.id] || 0;
        totalAssists += match.player_stats.assists[player.id] || 0;
      }
    }
  });

  const averageGrade = gradeCount > 0 ? (totalGrades / gradeCount).toFixed(1) : "N/A";

  const formatPosition = (position: string) => {
    if (position === 'TRÄNARE') return 'Tränare';
    
    let formattedPosition = position
      .replace('MV', 'Målvakt')
      .replace('BACK', 'Back')
      .replace('MF', 'Mittfält')
      .replace('ANF', 'Anfall');
    
    return formattedPosition;
  };

  const isCoach = player.positions?.includes('TRÄNARE');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Compact Player Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={player.image} alt={player.name} />
              <AvatarFallback className="text-lg font-semibold">
                {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{player.name}</h2>
                {player.jerseyNumber && !isCoach && (
                  <Badge variant="outline">#{player.jerseyNumber}</Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {isCoach ? (
                  <Badge className="bg-amber-500">Tränare</Badge>
                ) : (
                  <Badge>Nivå {player.grade}</Badge>
                )}
                
                {!isCoach && player.positions && player.positions.length > 0 && (
                  <Badge variant="outline">
                    {player.positions
                      .filter(pos => pos !== 'TRÄNARE')
                      .map(formatPosition)
                      .join(', ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Section - Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Aktivitetsstatistik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Totalt aktiviteter:</span>
              <span className="font-medium">{playerActivities.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Matcher:</span>
              <span className="font-medium">{matches.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cuper:</span>
              <span className="font-medium">{cups.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vinstprocent:</span>
              <span className="font-medium">{winPercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Prestationsstatistik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mål:</span>
              <span className="font-medium">{totalGoals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assists:</span>
              <span className="font-medium">{totalAssists}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Betyg snitt:</span>
              <span className="font-medium">{averageGrade}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Chart and Leagues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!isCoach && (
          <DevelopmentChart 
            development={player.development} 
            className="h-fit"
          />
        )}
        
        <LeaguesStatsCard 
          player={player} 
          activities={activities}
          className="h-fit"
        />
      </div>
    </div>
  );
}
