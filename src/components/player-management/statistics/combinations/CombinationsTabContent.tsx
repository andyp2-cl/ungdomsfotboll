
import React, { useMemo, useState } from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzePairCombinations, createCombinationMatrix, analyzePositionCombinations } from "@/utils/playerCombinations";
import { CombinationsList } from "./CombinationsList";
import { CombinationMatrix } from "./CombinationMatrix";
import { PositionSynergyChart } from "./PositionSynergyChart";
import { PlayerPartnerAnalysis } from "./PlayerPartnerAnalysis";
import { Users, Network, TrendingUp, Target } from "lucide-react";

interface CombinationsTabContentProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function CombinationsTabContent({ players, activities, onPlayerSelect }: CombinationsTabContentProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const combinations = useMemo(() => {
    return analyzePairCombinations(players, activities);
  }, [players, activities]);

  const combinationMatrix = useMemo(() => {
    return createCombinationMatrix(players, combinations);
  }, [players, combinations]);

  const positionAnalysis = useMemo(() => {
    return analyzePositionCombinations(combinations, players);
  }, [combinations, players]);

  const activePlayers = players.filter(p => !p.positions?.includes('TRÄNARE'));
  const topCombinations = combinations.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Analyserade par</p>
                <p className="text-2xl font-bold">{combinations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Bästa effektivitet</p>
                <p className="text-2xl font-bold">
                  {topCombinations[0]?.combinationEfficiency.toFixed(2) || "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Genomsnittlig vinst%</p>
                <p className="text-2xl font-bold">
                  {combinations.length > 0 
                    ? Math.round(combinations.reduce((sum, c) => sum + c.winRate, 0) / combinations.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Positionskombinationer</p>
                <p className="text-2xl font-bold">{Object.keys(positionAnalysis).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="top-combinations">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="top-combinations">Topp kombinationer</TabsTrigger>
          <TabsTrigger value="matrix">Kompatibilitetsmatris</TabsTrigger>
          <TabsTrigger value="positions">Positionssynergi</TabsTrigger>
          <TabsTrigger value="individual">Individuell analys</TabsTrigger>
        </TabsList>

        <TabsContent value="top-combinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bästa spelarkombinationer</CardTitle>
              <CardDescription>
                Rankade efter kombinationseffektivitet baserat på vinster, mål/assists och positionssynergi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CombinationsList 
                combinations={topCombinations} 
                onPlayerSelect={onPlayerSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kompatibilitetsmatris</CardTitle>
              <CardDescription>
                Visar hur bra olika spelare fungerar tillsammans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CombinationMatrix 
                matrix={combinationMatrix} 
                players={activePlayers}
                onPlayerSelect={onPlayerSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Positionssynergi</CardTitle>
              <CardDescription>
                Analys av vilka positionskombinationer som fungerar bäst
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PositionSynergyChart 
                positionAnalysis={positionAnalysis}
                onPlayerSelect={onPlayerSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individuell spelaranalys</CardTitle>
              <CardDescription>
                Välj en spelare för att se deras bästa partners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlayerPartnerAnalysis 
                players={activePlayers}
                combinations={combinations}
                selectedPlayer={selectedPlayer}
                onPlayerSelect={(playerId) => {
                  setSelectedPlayer(playerId);
                  onPlayerSelect?.(playerId);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
