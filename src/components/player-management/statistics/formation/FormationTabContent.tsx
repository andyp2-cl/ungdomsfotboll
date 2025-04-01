
import React, { useState } from "react";
import { Activity, Player, PlayerPosition } from "@/types/player";
import { TeamFormationAnalysis } from "./TeamFormationAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { UsersRound } from "lucide-react";

interface FormationTabContentProps {
  players: Player[];
  activities: Activity[];
}

export function FormationTabContent({ players, activities }: FormationTabContentProps) {
  const [selectedTab, setSelectedTab] = useState<"overview" | "players">("overview");
  
  // Group players by position
  const playersByPosition: Record<string, Player[]> = {};
  
  players.forEach(player => {
    if (player.positions && player.positions.length > 0) {
      player.positions.forEach(position => {
        if (!playersByPosition[position]) {
          playersByPosition[position] = [];
        }
        playersByPosition[position].push(player);
      });
    } else {
      if (!playersByPosition["OKÄND"]) {
        playersByPosition["OKÄND"] = [];
      }
      playersByPosition["OKÄND"].push(player);
    }
  });
  
  const positionLabels: Record<string, string> = {
    "MV": "Målvakt",
    "BACK": "Back",
    "MF": "Mittfältare",
    "ANF": "Anfallare",
    "TRÄNARE": "Tränare",
    "OKÄND": "Okänd position"
  };
  
  // Get counts for distribution
  const positionCounts = Object.entries(playersByPosition)
    .filter(([position]) => position !== "TRÄNARE") // Exclude coach from counts
    .map(([position, players]) => ({
      position,
      count: players.length,
      label: positionLabels[position] || position
    }));
  
  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as "overview" | "players")}>
        <TabsList>
          <TabsTrigger value="overview">Överblick</TabsTrigger>
          <TabsTrigger value="players">Spelare per position</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersRound className="h-5 w-5" />
                  Lagets positionsfördelning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <TeamFormationAnalysis players={players} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Positionsöverblick</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {positionCounts.map(({position, count, label}) => (
                    <div key={position} className="flex items-center justify-between">
                      <span className="font-medium">{label}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{count} spelare</span>
                        <Badge variant={count < 2 ? "destructive" : count < 4 ? "outline" : "default"}>
                          {count < 2 ? "För få" : count < 4 ? "Tillräckligt" : "Bra"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="players">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(playersByPosition).map(([position, positionPlayers]) => (
              <Card key={position}>
                <CardHeader>
                  <CardTitle>{positionLabels[position] || position} ({positionPlayers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-60 pr-4">
                    <div className="space-y-2">
                      {positionPlayers.map(player => (
                        <div key={player.id} className="p-2 border rounded flex justify-between items-center">
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm text-muted-foreground">Nivå {player.grade}</div>
                          </div>
                          {player.jerseyNumber && (
                            <Badge variant="outline">#{player.jerseyNumber}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
