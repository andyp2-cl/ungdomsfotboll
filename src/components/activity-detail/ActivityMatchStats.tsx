
import React from "react";
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ActivityMatchStatsProps {
  activity: Activity;
  players: Player[];
  participatingPlayers: Player[];
  updateActivity: (updatedActivity: Activity) => void;
}

export function ActivityMatchStats({ 
  activity, 
  players, 
  participatingPlayers, 
  updateActivity 
}: ActivityMatchStatsProps) {
  
  const getTotalGoals = () => {
    if (!activity.player_stats?.goals) return 0;
    return Object.values(activity.player_stats.goals).reduce((sum, goals) => sum + (goals as number), 0);
  };

  const getTotalAssists = () => {
    if (!activity.player_stats?.assists) return 0;
    return Object.values(activity.player_stats.assists).reduce((sum, assists) => sum + (assists as number), 0);
  };

  const handleGoalChange = (playerId: string, change: number) => {
    const updatedActivity = {...activity};
    
    if (!updatedActivity.player_stats) {
      updatedActivity.player_stats = { goals: {}, assists: {} };
    }
    
    if (!updatedActivity.player_stats.goals) {
      updatedActivity.player_stats.goals = {};
    }
    
    const currentGoals = updatedActivity.player_stats.goals[playerId] || 0;
    const newGoals = Math.max(0, currentGoals + change);
    
    updatedActivity.player_stats.goals[playerId] = newGoals;
    
    updateActivity(updatedActivity);
  };

  const handleAssistChange = (playerId: string, change: number) => {
    const updatedActivity = {...activity};
    
    if (!updatedActivity.player_stats) {
      updatedActivity.player_stats = { goals: {}, assists: {} };
    }
    
    if (!updatedActivity.player_stats.assists) {
      updatedActivity.player_stats.assists = {};
    }
    
    const currentAssists = updatedActivity.player_stats.assists[playerId] || 0;
    const newAssists = Math.max(0, currentAssists + change);
    
    updatedActivity.player_stats.assists[playerId] = newAssists;
    
    updateActivity(updatedActivity);
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matchstatistik</h3>
      
      {participatingPlayers.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-2">Anteckna hur många mål och assist varje spelare har gjort:</p>
          
          {participatingPlayers.map(player => {
            const goals = activity.player_stats?.goals?.[player.id] || 0;
            const assists = activity.player_stats?.assists?.[player.id] || 0;
            
            return (
              <div key={player.id} className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">{player.name}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <span className="text-xs mr-2">Mål:</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 rounded-full"
                      onClick={() => handleGoalChange(player.id, -1)}
                      disabled={goals === 0}
                    >
                      -
                    </Button>
                    <span className="mx-2 w-6 text-center">{goals}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 rounded-full"
                      onClick={() => handleGoalChange(player.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-xs mr-2">Assist:</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 rounded-full"
                      onClick={() => handleAssistChange(player.id, -1)}
                      disabled={assists === 0}
                    >
                      -
                    </Button>
                    <span className="mx-2 w-6 text-center">{assists}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 rounded-full"
                      onClick={() => handleAssistChange(player.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="mt-4 flex gap-4 justify-center">
            <Badge variant="outline" className="text-sm px-3 py-1 bg-green-50 text-green-700 border-green-200">
              Mål: {getTotalGoals()}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
              Assist: {getTotalAssists()}
            </Badge>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">Lägg till spelare för att registrera mål och assist.</p>
      )}
    </div>
  );
}
