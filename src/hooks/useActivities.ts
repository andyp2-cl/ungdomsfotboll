import { useState, useEffect, useMemo } from "react";
import { Activity, ActivityType, Player } from "@/types/player";
import { getStoredActivities, saveActivities, savePlayers } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export function useActivities(players: Player[], setPlayers: (players: Player[]) => void) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<ActivityType[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const storedActivities = await getStoredActivities();
        if (storedActivities.length > 0) {
          setActivities(storedActivities);
        } else {
          toast({
            title: "Inga aktiviteter hittades",
            description: "Inga aktiviteter hittades i databasen.",
          });
        }
      } catch (error) {
        console.error("Error loading activities:", error);
        toast({
          title: "Kunde inte ladda aktiviteter",
          description: "Ett fel uppstod när aktiviteter skulle hämtas från databasen.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [toast]);

  const { currentActivities, historicalActivities } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const current: Activity[] = [];
    const historical: Activity[] = [];
    
    activities.forEach(activity => {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      
      if (activityDate >= today) {
        current.push(activity);
      } else {
        historical.push(activity);
      }
    });
    
    return { currentActivities: current, historicalActivities: historical };
  }, [activities]);

  const arePlayersEqual = (playersA: Player[], playersB: Player[]) => {
    if (playersA.length !== playersB.length) return false;
    
    for (let i = 0; i < playersA.length; i++) {
      const playerA = playersA[i];
      const playerB = playersB[i];
      
      if (playerA.id !== playerB.id) return false;
      
      if (!arraysEqual(playerA.activities || [], playerB.activities || [])) {
        return false;
      }
    }
    
    return true;
  };
  
  const arraysEqual = (a: any[], b: any[]) => {
    if (a.length !== b.length) return false;
    
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    
    for (let i = 0; i < sortedA.length; i++) {
      if (sortedA[i] !== sortedB[i]) return false;
    }
    
    return true;
  };

  const handleActivityTypeChange = (type: ActivityType) => {
    setSelectedActivityTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
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

  const handleAddActivity = async (newActivity: Activity) => {
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
    
    toast({
      title: "Aktivitet tillagd",
      description: `${newActivity.name} har lagts till.`,
    });
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

  const handleClearHistoricalActivities = async () => {
    if (historicalActivities.length === 0) {
      toast({
        title: "Inga tidigare aktiviteter",
        description: "Det finns inga tidigare aktiviteter att rensa.",
      });
      return;
    }
    
    setActivities(currentActivities);
    await saveActivities(currentActivities);
    
    if (selectedActivity && historicalActivities.some(a => a.id === selectedActivity.id)) {
      setSelectedActivity(null);
    }
    
    const historicalActivityIds = historicalActivities.map(a => a.id);
    const updatedPlayers = players.map(player => {
      if (player.activities && player.activities.some(id => historicalActivityIds.includes(id))) {
        return {
          ...player,
          activities: player.activities.filter(id => !historicalActivityIds.includes(id))
        };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);
    
    toast({
      title: "Tidigare aktiviteter rensade",
      description: `${historicalActivities.length} tidigare aktiviteter har tagits bort.`,
    });
  };

  const filteredCurrentActivities = useMemo(() => {
    return currentActivities
      .filter(activity => {
        return selectedActivityTypes.length === 0 || selectedActivityTypes.includes(activity.type);
      })
      .sort((a, b) => {
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        
        if (dateComparison === 0 && a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        
        return dateComparison;
      });
  }, [selectedActivityTypes, currentActivities]);

  const filteredHistoricalActivities = useMemo(() => {
    return historicalActivities
      .filter(activity => {
        return selectedActivityTypes.length === 0 || selectedActivityTypes.includes(activity.type);
      })
      .sort((a, b) => {
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        
        if (dateComparison === 0 && a.time && b.time) {
          return b.time.localeCompare(a.time);
        }
        
        return dateComparison;
      });
  }, [selectedActivityTypes, historicalActivities]);

  return {
    activities,
    isLoading,
    selectedActivityTypes,
    selectedActivity,
    setSelectedActivity,
    editingActivity,
    setEditingActivity,
    isAddActivityOpen,
    setIsAddActivityOpen,
    filteredActivities: filteredCurrentActivities,
    filteredHistoricalActivities,
    handleActivityTypeChange,
    handleActivityUpdate,
    handleKioskAssignmentUpdate,
    handleAddActivity,
    handleImportedActivities,
    handleScrapedMatches,
    handleDeleteAllActivities,
    handleClearHistoricalActivities
  };
}
