import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { mockPlayers, mockActivities } from "@/data/mockData";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerDetail } from "@/components/PlayerDetail";
import { PlayerFilter } from "@/components/PlayerFilter";
import { SearchInput } from "@/components/SearchInput";
import { ActivityFilter } from "@/components/ActivityFilter";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetail } from "@/components/ActivityDetail";
import { MatchScraper } from "@/components/MatchScraper";
import { Player, PlayerGrade, ActivityType, Activity } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid, List, Plus, UserPlus, Activity as ActivityIcon, Edit } from "lucide-react";
import { PlayerList } from "@/components/PlayerList";
import { useToast } from "@/hooks/use-toast";
import { EditPlayerForm } from "@/components/EditPlayerForm";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { AddActivityForm } from "@/components/AddActivityForm";
import { EditActivityForm } from "@/components/EditActivityForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from 'uuid';
import { generateFootballFieldUrl } from "@/utils/locationUtils";
import { FileImport } from "@/components/FileImport";
import { 
  getStoredPlayers, 
  savePlayers, 
  getStoredActivities, 
  saveActivities,
  saveActiveTab,
  getActiveTab
} from "@/utils/storage";

interface PlayersPageProps {
  initialTab?: string;
}

const aprilActivities: Activity[] = [
  {
    id: uuidv4(),
    name: "Hässleholms IF svart - Vinslövs IF",
    date: "2025-04-12",
    time: "09:30",
    type: "match",
    participants: [],
    location: {
      name: "Österås IP",
      description: "Plan 7-manna 1",
      gpsLink: generateFootballFieldUrl("Österås IP")
    }
  },
  {
    id: uuidv4(),
    name: "Hässleholms IF grön - IFK Osby vit",
    date: "2025-04-12",
    time: "11:00",
    type: "match",
    participants: [],
    location: {
      name: "Österås IP",
      description: "Plan 7-manna 1",
      gpsLink: generateFootballFieldUrl("Österås IP")
    }
  },
  {
    id: uuidv4(),
    name: "Ifö Bromölla IF - Hässleholms IF",
    date: "2025-04-12",
    time: "12:00",
    type: "match",
    participants: [],
    location: {
      name: "Strandängens IP",
      description: "C-plan 7-manna 1",
      gpsLink: generateFootballFieldUrl("Strandängens IP", "Bromölla")
    }
  },
  {
    id: uuidv4(),
    name: "Kristianstad FC svart - Hässleholms IF Vit",
    date: "2025-04-13",
    time: "12:00",
    type: "match",
    participants: [],
    location: {
      name: "Vilans IP",
      description: "B-plan",
      gpsLink: generateFootballFieldUrl("Vilans IP", "Kristianstad")
    }
  },
  {
    id: uuidv4(),
    name: "Hässleholms IF - Åhus Horna BK vit",
    date: "2025-04-19",
    time: "11:00",
    type: "match",
    participants: [],
    location: {
      name: "Österås IP",
      description: "Plan 7-manna 1",
      gpsLink: generateFootballFieldUrl("Österås IP")
    }
  },
  {
    id: uuidv4(),
    name: "Hässleholms IF Vit - Nosaby IF blå",
    date: "2025-04-20",
    time: "09:30",
    type: "match",
    participants: [],
    location: {
      name: "Österås IP",
      description: "Plan 7-manna 1",
      gpsLink: generateFootballFieldUrl("Österås IP")
    }
  },
  {
    id: uuidv4(),
    name: "Nosaby IF grön - Hässleholms IF grön",
    date: "2025-04-20",
    time: "10:00",
    type: "match",
    participants: [],
    location: {
      name: "Nya Vallboskolan",
      description: "D-plan 7-manna 1",
      gpsLink: generateFootballFieldUrl("Nya Vallboskolan", "Kristianstad")
    }
  },
  {
    id: uuidv4(),
    name: "Sibbhults IF - Hässleholms IF svart",
    date: "2025-04-21",
    time: "10:00",
    type: "match",
    participants: [],
    location: {
      name: "Färevallen",
      description: "A-plan 7-manna 1",
      gpsLink: generateFootballFieldUrl("Färevallen", "Sibbhult")
    }
  },
  {
    id: uuidv4(),
    name: "Höör IS blå - Hässleholms IF Vit",
    date: "2025-04-26",
    time: "14:30",
    type: "match",
    participants: [],
    location: {
      name: "Färs & Frosta Arena",
      description: "Höör konstgräs 7-manna 1",
      gpsLink: generateFootballFieldUrl("Färs & Frosta Arena", "Höör")
    }
  },
  {
    id: uuidv4(),
    name: "Hässleholms IF svart - Broby IF orange",
    date: "2025-04-26",
    time: "09:30",
    type: "match",
    participants: [],
    location: {
      name: "Österås IP",
      description: "Plan 7-manna 1",
      gpsLink: generateFootballFieldUrl("Österås IP")
    }
  },
  {
    id: uuidv4(),
    name: "Kristianstad FC orange - Hässleholms IF grön",
    date: "2025-04-26",
    time: "12:00",
    type: "match",
    participants: [],
    location: {
      name: "Björkvallen",
      description: "Kristianstad A-plan 7-manna 1",
      gpsLink: generateFootballFieldUrl("Björkvallen", "Kristianstad")
    }
  },
  {
    id: uuidv4(),
    name: "Vinnö IF vit - Hässleholms IF",
    date: "2025-04-27",
    time: "10:00",
    type: "match",
    participants: [],
    location: {
      name: "Vinnö IP",
      description: "A-plan 7-manna 1",
      gpsLink: generateFootballFieldUrl("Vinnö IP", "Vinnö")
    }
  }
];

export default function PlayersPage({ initialTab }: PlayersPageProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathTab = location.pathname === "/activities" ? "activities" : "players";
  const storedTab = getActiveTab();
  
  const [activeTab, setActiveTab] = useState(pathTab || initialTab || storedTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<PlayerGrade[]>([]);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<ActivityType[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    saveActiveTab(activeTab);
    
    if (activeTab === "activities" && location.pathname !== "/activities") {
      navigate("/activities", { replace: true });
    } else if (activeTab === "players" && location.pathname !== "/players") {
      navigate("/players", { replace: true });
    }
  }, [activeTab, navigate, location.pathname]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const storedPlayers = await getStoredPlayers();
        setPlayers(storedPlayers);
        
        const storedActivities = await getStoredActivities();
        if (storedActivities.length > 0) {
          setActivities(storedActivities);
        } else {
          const cutoffDate = new Date('2025-03-31');
          
          const filteredActivities = mockActivities.filter(activity => {
            const activityDate = new Date(activity.date);
            return activityDate >= cutoffDate;
          });
          
          const initialActivities = [...filteredActivities, ...aprilActivities];
          setActivities(initialActivities);
          await saveActivities(initialActivities);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Kunde inte ladda data",
          description: "Ett fel uppstod när data skulle hämtas från databasen.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  const isKioskEligible = (activity: Activity): boolean => {
    if (!activity.location) return false;
    
    const isAtÖsteråsIP = activity.location.name.includes('Österås IP');
    const isHomeMatch = activity.name.toLowerCase().startsWith('hässleholms if');
    
    return isAtÖsteråsIP && isHomeMatch;
  };

  const handleImportedActivities = async (importedActivities: Activity[]) => {
    const updatedActivities = [...activities, ...importedActivities];
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
    toast({
      title: "Aktiviteter importerade",
      description: `${importedActivities.length} aktiviteter har importerats från fil.`,
    });
  };

  const handleScrapedMatches = async (newActivities: Activity[], clearExisting: boolean = false) => {
    if (clearExisting) {
      setActivities(newActivities);
      await saveActivities(newActivities);
      toast({
        title: "Aktiviteter ersatta",
        description: `Alla tidigare aktiviteter har tagits bort och ${newActivities.length} nya aktiviteter har lagts till.`,
      });
    } else {
      const updatedActivities = [...activities, ...newActivities];
      setActivities(updatedActivities);
      await saveActivities(updatedActivities);
      toast({
        title: "Matcher importerade",
        description: `${newActivities.length} nya matcher har lagts till.`,
      });
    }
  };

  const handleDeleteAllActivities = async () => {
    setActivities([]);
    await saveActivities([]);
    if (selectedActivity) {
      setSelectedActivity(null);
    }
    toast({
      title: "Aktiviteter raderade",
      description: "Alla aktiviteter har tagits bort.",
    });
  };

  const handleGradeChange = (grade: PlayerGrade) => {
    setSelectedGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade) 
        : [...prev, grade]
    );
  };

  const handleActivityTypeChange = (type: ActivityType) => {
    setSelectedActivityTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const handlePlayerUpdate = async (updatedPlayer: Player) => {
    const updatedPlayers = players.map(player => 
      player.id === updatedPlayer.id ? updatedPlayer : player
    );
    
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);
    
    if (selectedPlayer && selectedPlayer.id === updatedPlayer.id) {
      setSelectedPlayer(updatedPlayer);
    }
    
    toast({
      title: "Spelaren uppdaterad",
      description: `${updatedPlayer.name} har uppdaterats.`,
    });
  };

  const handleActivityUpdate = async (updatedActivity: Activity) => {
    const updatedActivities = activities.map(activity => 
      activity.id === updatedActivity.id ? updatedActivity : activity
    );
    
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
    
    if (selectedActivity && selectedActivity.id === updatedActivity.id) {
      setSelectedActivity(updatedActivity);
    }
    
    if (updatedActivity.participants) {
      const updatedPlayers = players.map(player => {
        const isParticipating = updatedActivity.participants?.includes(player.id);
        let playerActivities = player.activities || [];
        
        if (isParticipating && !playerActivities.includes(updatedActivity.id)) {
          return {
            ...player,
            activities: [...playerActivities, updatedActivity.id]
          };
        } else if (!isParticipating && playerActivities.includes(updatedActivity.id)) {
          return {
            ...player,
            activities: playerActivities.filter(id => id !== updatedActivity.id)
          };
        }
        
        return player;
      });
      
      setPlayers(updatedPlayers);
      await savePlayers(updatedPlayers);
    }
    
    toast({
      title: "Aktivitet uppdaterad",
      description: `${updatedActivity.name} har uppdaterats.`,
    });
  };

  const handleKioskAssignmentUpdate = async (activityId: string, playerId?: string) => {
    const updatedActivities = activities.map(activity => 
      activity.id === activityId 
        ? { ...activity, kioskAssignedPlayerId: playerId }
        : activity
    );
    
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
    
    if (selectedActivity && selectedActivity.id === activityId) {
      setSelectedActivity(prev => prev ? { ...prev, kioskAssignedPlayerId: playerId } : null);
    }
    
    toast({
      title: "Kioskansvarig uppdaterad",
      description: playerId 
        ? `Ny spelare har tilldelats kioskansvar för denna aktivitet.`
        : `Kioskansvarig har tagits bort från denna aktivitet.`,
    });
  };

  const handleEditPlayerClick = (player: Player) => {
    setEditingPlayer(player);
  };

  const handleEditActivityClick = (activity: Activity) => {
    setEditingActivity(activity);
  };

  const handleAddPlayer = async (newPlayer: Player) => {
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);
    setIsAddPlayerOpen(false);
    toast({
      title: "Spelare tillagd",
      description: `${newPlayer.name} har lagts till.`,
    });
  };

  const handleAddActivity = async (newActivity: Activity) => {
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
    setIsAddActivityOpen(false);
    toast({
      title: "Aktivitet tillagd",
      description: `${newActivity.name} har lagts till.`,
    });
  };

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(player.grade);
      return matchesSearch && matchesGrade;
    });
  }, [searchQuery, selectedGrades, players]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      return selectedActivityTypes.length === 0 || selectedActivityTypes.includes(activity.type);
    });
  }, [selectedActivityTypes, activities]);

  if (isLoading) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Fotbollsspelare</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Laddar data från databasen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Fotbollsspelare</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <div className="flex justify-between items-center mb-4">
              <Button 
                onClick={() => setIsAddPlayerOpen(true)}
                className="mb-4"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Lägg till spelare
              </Button>
              
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
              activities={activities}
              onClose={() => setSelectedPlayer(null)} 
              onPlayerUpdate={handlePlayerUpdate}
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map(player => (
                  <PlayerCard 
                    key={player.id} 
                    player={player} 
                    onClick={() => setSelectedPlayer(player)}
                    onEdit={handleEditPlayerClick}
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
              onEdit={handleEditPlayerClick}
            />
          )}
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Alla aktiviteter</h2>
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => setIsAddActivityOpen(true)}
                  >
                    <ActivityIcon className="h-4 w-4 mr-2" />
                    Lägg till aktivitet
                  </Button>
                  <ActivityFilter 
                    selectedTypes={selectedActivityTypes}
                    onTypeChange={handleActivityTypeChange}
                  />
                </div>
              </div>
              
              {selectedActivity ? (
                <ActivityDetail
                  activity={selectedActivity}
                  players={players}
                  onClose={() => setSelectedActivity(null)}
                  onEdit={handleEditActivityClick}
                  onActivityUpdate={handleActivityUpdate}
                  onKioskAssignmentUpdate={handleKioskAssignmentUpdate}
                />
              ) : (
                <ActivityList 
                  activities={filteredActivities} 
                  onSelect={setSelectedActivity}
                  players={players} 
                />
              )}
            </div>
            
            <div className="md:col-span-1 space-y-6">
              <FileImport onActivitiesImported={handleImportedActivities} />
              <MatchScraper 
                onMatchesScraped={handleScrapedMatches} 
                onDeleteAllActivities={handleDeleteAllActivities}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={editingPlayer !== null} onOpenChange={(open) => !open && setEditingPlayer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redigera spelare</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <EditPlayerForm 
              player={editingPlayer} 
              onSave={(updatedPlayer) => {
                handlePlayerUpdate(updatedPlayer);
                setEditingPlayer(null);
              }}
              onCancel={() => setEditingPlayer(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editingActivity !== null} onOpenChange={(open) => !open && setEditingActivity(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redigera aktivitet</DialogTitle>
          </DialogHeader>
          {editingActivity && (
            <EditActivityForm 
              activity={editingActivity} 
              onSave={(updatedActivity) => {
                handleActivityUpdate(updatedActivity);
                setEditingActivity(null);
              }}
              onCancel={() => setEditingActivity(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lägg till ny spelare</DialogTitle>
          </DialogHeader>
          <AddPlayerForm 
            onSave={handleAddPlayer}
            onCancel={() => setIsAddPlayerOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lägg till ny aktivitet</DialogTitle>
          </DialogHeader>
          <AddActivityForm 
            onSave={handleAddActivity}
            onCancel={() => setIsAddActivityOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
