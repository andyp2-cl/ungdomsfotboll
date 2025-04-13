
import React from "react";
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatsSectionProps {
  activity: Activity;
  players: Player[];
  participatingPlayers: Player[];
  updateActivity: (updatedActivity: Activity) => void;
  isHistorical: boolean;
}

export function StatsSection({ 
  activity, 
  players,
  participatingPlayers,
  updateActivity,
  isHistorical
}: StatsSectionProps) {
  const isMobile = useIsMobile();
  
  // Only show stats section for historical matches
  if (!isHistorical) {
    return null;
  }
  
  // Get total goals and assists
  const getTotalGoals = () => {
    if (!activity.player_stats?.goals) return 0;
    return Object.values(activity.player_stats.goals).reduce((sum, goals) => sum + (goals as number), 0);
  };

  const getTotalAssists = () => {
    if (!activity.player_stats?.assists) return 0;
    return Object.values(activity.player_stats.assists).reduce((sum, assists) => sum + (assists as number), 0);
  };

  // Update player stats - always allow editing for historical matches
  const updatePlayerStat = (playerId: string, statType: 'goals' | 'assists', value: number) => {
    console.log(`Updating ${statType} for player ${playerId} to ${value}`);
    
    const updatedActivity = { ...activity };
    
    if (!updatedActivity.player_stats) {
      updatedActivity.player_stats = { goals: {}, assists: {} };
    }
    
    if (!updatedActivity.player_stats[statType]) {
      updatedActivity.player_stats[statType] = {};
    }
    
    // @ts-ignore (we know this is valid)
    updatedActivity.player_stats[statType][playerId] = value;
    
    // Update the activity with the new stats
    updateActivity(updatedActivity);
  };

  return (
    <div className={`border rounded-md ${isMobile ? 'p-3' : 'p-4'}`}>
      <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-3`}>Matchstatistik</h3>
      
      {participatingPlayers.length > 0 ? (
        <div className="space-y-3">
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mb-2`}>
            Uppdatera statistik för spelarnas mål och assist:
          </p>
          
          {participatingPlayers.map(player => {
            const goals = activity.player_stats?.goals?.[player.id] || 0;
            const assists = activity.player_stats?.assists?.[player.id] || 0;
            
            return (
              <div key={player.id} className={`${isMobile ? 'flex flex-col gap-2' : 'flex justify-between items-center'} border-b pb-2`}>
                <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{player.name}</span>
                <div className={`${isMobile ? 'flex justify-between' : 'flex items-center gap-4'}`}>
                  <div className="flex items-center">
                    <span className={`${isMobile ? 'text-xs mr-1' : 'text-xs mr-2'}`}>Mål:</span>
                    <>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} rounded-full`}
                        onClick={() => {
                          if (goals > 0) {
                            updatePlayerStat(player.id, 'goals', goals - 1);
                          }
                        }}
                        disabled={goals === 0}
                      >
                        <Minus className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                      </Button>
                      <span className="mx-2 w-6 text-center">{goals}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} rounded-full`}
                        onClick={() => updatePlayerStat(player.id, 'goals', goals + 1)}
                      >
                        <Plus className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                      </Button>
                    </>
                  </div>
                  
                  <div className="flex items-center">
                    <span className={`${isMobile ? 'text-xs mr-1' : 'text-xs mr-2'}`}>Assist:</span>
                    <>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} rounded-full`}
                        onClick={() => {
                          if (assists > 0) {
                            updatePlayerStat(player.id, 'assists', assists - 1);
                          }
                        }}
                        disabled={assists === 0}
                      >
                        <Minus className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                      </Button>
                      <span className="mx-2 w-6 text-center">{assists}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} rounded-full`}
                        onClick={() => updatePlayerStat(player.id, 'assists', assists + 1)}
                      >
                        <Plus className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                      </Button>
                    </>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className={`mt-4 flex gap-4 justify-center ${isMobile ? 'text-xs' : ''}`}>
            <Badge variant="outline" className={`${isMobile ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'} bg-green-50 text-green-700 border-green-200`}>
              Mål: {getTotalGoals()}
            </Badge>
            <Badge variant="outline" className={`${isMobile ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'} bg-blue-50 text-blue-700 border-blue-200`}>
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
