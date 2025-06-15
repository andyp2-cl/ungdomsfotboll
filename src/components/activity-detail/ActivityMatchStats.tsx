
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sortPlayersByGrade } from "@/utils/gradeUtils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface ActivityMatchStatsProps {
  activity: Activity;
  players: Player[];
  participatingPlayers: Player[];
  updateActivity: (activity: Activity) => void;
  isHistorical?: boolean;
}

export function ActivityMatchStats({
  activity,
  players,
  participatingPlayers,
  updateActivity,
  isHistorical = false
}: ActivityMatchStatsProps) {
  const isMobile = useIsMobile();
  
  // Sort participants by grade (A, B, C, D)
  const sortedParticipants = sortPlayersByGrade(participatingPlayers);
  
  // Get total goals and assists
  const getTotalGoals = () => {
    if (!activity.player_stats?.goals) return 0;
    return Object.values(activity.player_stats.goals).reduce((sum, goals) => sum + (goals as number), 0);
  };

  const getTotalAssists = () => {
    if (!activity.player_stats?.assists) return 0;
    return Object.values(activity.player_stats.assists).reduce((sum, assists) => sum + (assists as number), 0);
  };

  // Update player stats - removed the isHistorical check to allow editing for historical matches
  const updatePlayerStat = (playerId: string, statType: 'goals' | 'assists', value: number) => {
    const updatedActivity = { ...activity };
    if (!updatedActivity.player_stats) {
      updatedActivity.player_stats = { goals: {}, assists: {} };
    }
    if (!updatedActivity.player_stats[statType]) {
      updatedActivity.player_stats[statType] = {};
    }
    // @ts-ignore (we know this is valid)
    updatedActivity.player_stats[statType][playerId] = value;
    updateActivity(updatedActivity);
  };

  // Kommentar & YouTube-länk local state
  const [matchReport, setMatchReport] = useState(activity.matchReport || "");
  const [youtubeLink, setYoutubeLink] = useState(activity.youtubeLink || "");
  const [saving, setSaving] = useState(false);

  // Spara kommentarer och länk
  const handleSaveExtras = async () => {
    setSaving(true);
    try {
      await updateActivity({
        ...activity,
        matchReport,
        youtubeLink,
      });
      toast({
        title: "Sparat",
        description: "Kommentar och länk har sparats.",
      });
    } catch (e) {
      toast({
        title: "Fel",
        description: "Kunde inte spara kommentar/länk.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matchstatistik</h3>
      
      {sortedParticipants.length > 0 ? (
        <ScrollArea className={isMobile ? "h-[80vh] min-h-[40vh] overflow-y-auto" : ""}>
          <div className="space-y-3 px-1">
            <p className="text-sm text-muted-foreground mb-2">
              {isHistorical ? 
                "Uppdatera statistik för spelarnas mål och assist:" : 
                "Anteckna hur många mål och assist varje spelare har gjort:"}
            </p>
            
            {sortedParticipants.map(player => {
              const goals = activity.player_stats?.goals?.[player.id] || 0;
              const assists = activity.player_stats?.assists?.[player.id] || 0;
              
              return (
                <div key={player.id} className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-start sm:items-center border-b pb-2`}>
                  <span className="font-medium mb-2 sm:mb-0">{player.name}</span>
                  <div className={`flex ${isMobile ? 'flex-col w-full space-y-2' : 'items-center gap-4'}`}>
                    <div className="flex items-center">
                      <span className="text-xs mr-2 w-8">Mål:</span>
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7 rounded-full"
                          onClick={() => {
                            if (goals > 0) {
                              updatePlayerStat(player.id, 'goals', goals - 1);
                            }
                          }}
                          disabled={goals === 0}
                        >
                          -
                        </Button>
                        <span className="mx-2 w-6 text-center">{goals}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7 rounded-full"
                          onClick={() => updatePlayerStat(player.id, 'goals', goals + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-xs mr-2 w-8">Assist:</span>
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7 rounded-full"
                          onClick={() => {
                            if (assists > 0) {
                              updatePlayerStat(player.id, 'assists', assists - 1);
                            }
                          }}
                          disabled={assists === 0}
                        >
                          -
                        </Button>
                        <span className="mx-2 w-6 text-center">{assists}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7 rounded-full"
                          onClick={() => updatePlayerStat(player.id, 'assists', assists + 1)}
                        >
                          +
                        </Button>
                      </div>
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
            {/* -------- Extra fält: Kommentar & YouTube-länk -------- */}
            <div className="border-t mt-6 pt-4 flex flex-col gap-2">
              <label htmlFor="match-report-detail" className="block text-sm font-medium">
                Kommentar / matchreferat
              </label>
              <Textarea
                id="match-report-detail"
                value={matchReport}
                onChange={e => setMatchReport(e.target.value)}
                placeholder="Lägg till en kommentar eller ett referat här..."
                className="min-h-[60px]"
                maxLength={2000}
              />
              <label htmlFor="youtube-link-detail" className="block text-sm font-medium mt-3">
                YouTube-länk
              </label>
              <Input
                id="youtube-link-detail"
                type="url"
                value={youtubeLink}
                onChange={e => setYoutubeLink(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <Button
                className="mt-3 w-full sm:w-auto"
                onClick={handleSaveExtras}
                disabled={saving}
                type="button"
              >
                {saving ? "Sparar..." : "Spara kommentar & länk"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      ) : (
        <p className="text-muted-foreground">Lägg till spelare för att registrera mål och assist.</p>
      )}
    </div>
  );
}

