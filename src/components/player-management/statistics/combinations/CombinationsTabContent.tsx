
import React, { useMemo, useState, useEffect } from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { analyzePairCombinations, createCombinationMatrix, analyzePositionCombinations, PlayerCombination } from "@/utils/playerCombinations";
import { CombinationsList } from "./CombinationsList";
import { ExtendedCombinationMatrix } from "./ExtendedCombinationMatrix";
import { PlayerSelectionControls } from "./PlayerSelectionControls";
import { CustomHeatmap } from "./CustomHeatmap";
import { PositionSynergyChart } from "./PositionSynergyChart";
import { PlayerPartnerAnalysis } from "./PlayerPartnerAnalysis";
import { Users, Network, TrendingUp, Target, Zap, Info } from "lucide-react";

interface CombinationsTabContentProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

const HelpTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function CombinationsTabContent({ players, activities, onPlayerSelect }: CombinationsTabContentProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedPlayersForHeatmap, setSelectedPlayersForHeatmap] = useState<string[]>([]);
  const [combinations, setCombinations] = useState<PlayerCombination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load combinations asynchronously
  useEffect(() => {
    const loadCombinations = async () => {
      setIsLoading(true);
      try {
        console.log("CombinationsTabContent: Loading combinations...");
        const result = await analyzePairCombinations(players, activities);
        console.log("CombinationsTabContent: Loaded", result.length, "combinations");
        setCombinations(result);
      } catch (error) {
        console.error("CombinationsTabContent: Error loading combinations:", error);
        setCombinations([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (players.length > 0 && activities.length > 0) {
      loadCombinations();
    } else {
      setCombinations([]);
      setIsLoading(false);
    }
  }, [players, activities]);

  const combinationMatrix = useMemo(() => {
    if (combinations.length === 0) return {};
    return createCombinationMatrix(players, combinations);
  }, [players, combinations]);

  const positionAnalysis = useMemo(() => {
    if (combinations.length === 0) return {};
    return analyzePositionCombinations(combinations, players);
  }, [combinations, players]);

  const activePlayers = players.filter(p => !p.positions?.includes('TRÄNARE'));
  const topCombinations = combinations.slice(0, 10);

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayersForHeatmap(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPlayersForHeatmap(activePlayers.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPlayersForHeatmap([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyserar spelarkombinationer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Help Section */}
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Förklaring av värden
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div><strong>Kombinationseffektivitet:</strong> Ett sammansatt mått baserat på vinst%, mål/assists och positionssynergi. Högre värde = bättre kombination.</div>
          <div><strong>Positionssynergi:</strong> Hur väl spelarnas positioner kompletterar varandra (1.0-1.4 skala).</div>
          <div><strong>Vinst%:</strong> Procent av matcher som denna kombination har vunnit tillsammans.</div>
          <div><strong>Mål + Assists:</strong> Totalt antal mål och assists för båda spelarna i gemensamma matcher.</div>
          <div><strong>Antal matcher:</strong> Hur många matcher spelarna har spelat tillsammans (minst 2 krävs för analys).</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">Analyserade par</p>
                  <HelpTooltip content="Antal spelarkombinationer som har spelat minst 2 matcher tillsammans" />
                </div>
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
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">Bästa effektivitet</p>
                  <HelpTooltip content="Högsta kombinationseffektivitet bland alla spelarkombinationer" />
                </div>
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
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">Genomsnittlig vinst%</p>
                  <HelpTooltip content="Genomsnittlig vinstprocent för alla spelarkombinationer" />
                </div>
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
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">Valda för heatmap</p>
                  <HelpTooltip content="Antal spelare som valts för heatmap-visualisering" />
                </div>
                <p className="text-2xl font-bold">{selectedPlayersForHeatmap.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="top-combinations">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="top-combinations">Topp kombinationer</TabsTrigger>
          <TabsTrigger value="matrix">Matris</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="positions">Positionssynergi</TabsTrigger>
          <TabsTrigger value="individual">Individuell analys</TabsTrigger>
        </TabsList>

        <TabsContent value="top-combinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Bästa spelarkombinationer
                <HelpTooltip content="Kombinationer rankade efter kombinationseffektivitet - ett sammansatt mått som tar hänsyn till vinster, mål/assists och positionssynergi" />
              </CardTitle>
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
              <CardTitle className="flex items-center gap-2">
                Kompatibilitetsmatris
                <HelpTooltip content="Visar kombinationseffektivitet mellan alla spelare. Kryssa i spelare för att inkludera dem i heatmap-analysen" />
              </CardTitle>
              <CardDescription>
                Visar alla spelare med möjlighet att välja specifika spelare för heatmap-analys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExtendedCombinationMatrix 
                matrix={combinationMatrix} 
                players={activePlayers}
                selectedPlayers={selectedPlayersForHeatmap}
                onPlayerToggle={handlePlayerToggle}
                onPlayerSelect={onPlayerSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <PlayerSelectionControls
            players={activePlayers}
            selectedPlayers={selectedPlayersForHeatmap}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onTogglePlayer={handlePlayerToggle}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Anpassad heatmap
                <HelpTooltip content="Interaktiv heatmap som visar kombinationseffektivitet för valda spelare med färgkodning baserad på prestanda" />
              </CardTitle>
              <CardDescription>
                Interaktiv heatmap som visar kombinationseffektivitet för valda spelare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomHeatmap 
                matrix={combinationMatrix} 
                players={activePlayers}
                selectedPlayerIds={selectedPlayersForHeatmap}
                onPlayerSelect={onPlayerSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Positionssynergi
                <HelpTooltip content="Analys av vilka positionskombinationer som historiskt fungerar bäst tillsammans" />
              </CardTitle>
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
              <CardTitle className="flex items-center gap-2">
                Individuell spelaranalys
                <HelpTooltip content="Välj en spelare för att se deras mest framgångsrika partners baserat på kombinationseffektivitet" />
              </CardTitle>
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
