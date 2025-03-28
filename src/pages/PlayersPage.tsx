
import { useState, useMemo } from "react";
import { mockPlayers, mockActivities } from "@/data/mockData";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerDetail } from "@/components/PlayerDetail";
import { PlayerFilter } from "@/components/PlayerFilter";
import { SearchInput } from "@/components/SearchInput";
import { ActivityFilter } from "@/components/ActivityFilter";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetail } from "@/components/ActivityDetail";
import { Player, PlayerGrade, ActivityType, Activity } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid, List } from "lucide-react";
import { PlayerList } from "@/components/PlayerList";

export default function PlayersPage() {
  // State för sökfråga och filtrering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<PlayerGrade[]>([]);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<ActivityType[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activeTab, setActiveTab] = useState("players");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Hantera byte av spelarens nivåfilter
  const handleGradeChange = (grade: PlayerGrade) => {
    setSelectedGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade) 
        : [...prev, grade]
    );
  };

  // Hantera byte av aktivitetstypsfilter
  const handleActivityTypeChange = (type: ActivityType) => {
    setSelectedActivityTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // Filtrera spelare baserat på sökfråga och valda nivåer
  const filteredPlayers = useMemo(() => {
    return mockPlayers.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(player.grade);
      return matchesSearch && matchesGrade;
    });
  }, [searchQuery, selectedGrades]);

  // Filtrera aktiviteter baserat på valda typer
  const filteredActivities = useMemo(() => {
    return mockActivities.filter(activity => {
      return selectedActivityTypes.length === 0 || selectedActivityTypes.includes(activity.type);
    });
  }, [selectedActivityTypes]);

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Fotbollsspelare</h1>
      
      <Tabs defaultValue="players" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="players">Spelare</TabsTrigger>
          <TabsTrigger value="activities">Aktiviteter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="players" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-2/3">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="w-full md:w-1/3">
              <PlayerFilter 
                selectedGrades={selectedGrades} 
                onGradeChange={handleGradeChange} 
              />
            </div>
          </div>

          {!selectedPlayer && (
            <div className="flex justify-end mb-4">
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
                <ToggleGroupItem value="grid" aria-label="Visa som rutnät">
                  <Grid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Visa som lista">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {selectedPlayer ? (
            <PlayerDetail 
              player={selectedPlayer} 
              activities={mockActivities}
              onClose={() => setSelectedPlayer(null)} 
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map(player => (
                  <PlayerCard 
                    key={player.id} 
                    player={player} 
                    onClick={() => setSelectedPlayer(player)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">Inga spelare hittades</p>
                </div>
              )}
            </div>
          ) : (
            <PlayerList
              players={filteredPlayers}
              onSelect={setSelectedPlayer}
            />
          )}
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Alla aktiviteter</h2>
            <ActivityFilter 
              selectedTypes={selectedActivityTypes}
              onTypeChange={handleActivityTypeChange}
            />
          </div>
          
          {selectedActivity ? (
            <ActivityDetail
              activity={selectedActivity}
              players={mockPlayers}
              onClose={() => setSelectedActivity(null)}
            />
          ) : (
            <ActivityList 
              activities={filteredActivities} 
              onSelect={setSelectedActivity} 
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
