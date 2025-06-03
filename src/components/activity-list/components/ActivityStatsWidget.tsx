
import React from "react";
import { Activity, Player } from "@/types/player";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Clock, Trophy } from "lucide-react";
import { PlayerLevelRadarChart } from "./PlayerLevelRadarChart";

interface ActivityStatsWidgetProps {
  activity: Activity;
  participants: Player[];
  isHistorical?: boolean;
  isMobile?: boolean;
}

export function ActivityStatsWidget({ 
  activity, 
  participants, 
  isHistorical = false,
  isMobile = false 
}: ActivityStatsWidgetProps) {
  // Calculate total goals and assists
  const totalGoals = activity.player_stats?.goals 
    ? Object.values(activity.player_stats.goals).reduce((sum, goals) => sum + goals, 0)
    : 0;
    
  const totalAssists = activity.player_stats?.assists
    ? Object.values(activity.player_stats.assists).reduce((sum, assists) => sum + assists, 0)
    : 0;

  // Calculate average grade (simplified scoring: A=4, B=3, C=2, D=1)
  const gradeValues = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
  const avgGrade = participants.length > 0 
    ? participants
        .filter(p => p.grade && gradeValues[p.grade as keyof typeof gradeValues])
        .reduce((sum, p) => sum + (gradeValues[p.grade as keyof typeof gradeValues] || 0), 0) / 
      Math.max(1, participants.filter(p => p.grade).length)
    : 0;

  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <PlayerLevelRadarChart participants={participants} size="small" />
        <div className="flex flex-col gap-1">
          {isHistorical && activity.type === "match" && (totalGoals > 0 || totalAssists > 0) && (
            <div className="flex gap-1">
              {totalGoals > 0 && (
                <Badge variant="outline" className="text-xs bg-green-50 border-green-200">
                  <Target className="w-2 h-2 mr-1" />
                  {totalGoals}
                </Badge>
              )}
              {totalAssists > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                  <Users className="w-2 h-2 mr-1" />
                  {totalAssists}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 min-w-0">
      <PlayerLevelRadarChart participants={participants} size="medium" />
      
      <div className="flex flex-col gap-1 items-center">
        {avgGrade > 0 && (
          <Badge variant="outline" className="text-xs">
            <Trophy className="w-3 h-3 mr-1" />
            Snitt: {avgGrade.toFixed(1)}
          </Badge>
        )}
        
        {isHistorical && activity.type === "match" && (
          <div className="flex gap-1">
            {totalGoals > 0 && (
              <Badge variant="outline" className="text-xs bg-green-50 border-green-200">
                <Target className="w-3 h-3 mr-1" />
                {totalGoals} mål
              </Badge>
            )}
            {totalAssists > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                <Users className="w-3 h-3 mr-1" />
                {totalAssists} assist
              </Badge>
            )}
          </div>
        )}
        
        {activity.time && (
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {activity.time}
          </Badge>
        )}
      </div>
    </div>
  );
}
