import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlayerTabContent } from "@/components/tabs/PlayerTabContent";
import { ActivityTabContent } from "@/components/tabs/activity-tab/ActivityTabContent";
import { StatisticsTabsWrapper } from "@/components/player-management/statistics/StatisticsTabsWrapper";
import { ExcelTabContent } from "@/components/tabs/excel-tab/ExcelTabContent";
import { DevelopmentTabContent } from "@/components/tabs/development-tab/DevelopmentTabContent";
import { TrainingTabContent } from "@/components/tabs/training-tab/TrainingTabContent";
import TeamSelectionPage from "@/pages/TeamSelectionPage";
import { PageDialogs } from "./PageDialogs";
import { Player, Activity, PlayerGrade } from "@/types/player";
import { TabItem } from "@/types/tabs";
import { saveActiveTab } from "@/utils/storage/tabs";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Users, Calendar, Trophy } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { CupsList } from "@/components/player-management/statistics/cups/components/CupsList";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { ActivityListWithMonthGrouping } from "@/components/activity-list/ActivityListWithMonthGrouping";

interface MainTabsProps {
  tabs?: TabItem[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;

  // Player state
  players: Player[];
  selectedPlayer: Player | null;
  filteredPlayers: Player[];
  editingPlayer: Player | null;
  searchQuery: string;
  selectedGrades: PlayerGrade[];
  viewMode: "list" | "grid";
  setSearchQuery: (query: string) => void;
  handleGradeChange: (grade: PlayerGrade) => void;
  setSelectedPlayer: (player: Player | null) => void;
  setEditingPlayer: (player: Player | null) => void;
  setViewMode: (mode: "list" | "grid") => void;
  isAddPlayerOpen: boolean;
  setIsAddPlayerOpen: (isOpen: boolean) => void;
  handlePlayerUpdate: (player: Player) => Promise<void>;
  handleBulkPlayerUpdate: (players: Player[]) => Promise<void>;
  handleAddPlayer: (player: Player) => Promise<void>;
  handleDeletePlayer?: (playerId: string) => Promise<void>;
  
  // Activity state
  activities: Activity[];
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  selectedActivity: Activity | null;
  setSelectedActivity: (activity: Activity | null) => void;
  editingActivity: Activity | null;
  setEditingActivity: (activity: Activity | null) => void;
  isAddActivityOpen: boolean;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  selectedActivityTypes: string[];
  handleActivityTypeChange: (type: string) => void;
  handleActivityUpdate: (activity: Activity) => Promise<void>;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDelete: (activityId: string) => Promise<boolean>;
  handleImportActivities: (activities: Activity[]) => Promise<boolean>;
  handleClearHistorical: () => Promise<boolean>;
  handleAddActivity: (activity: Activity) => Promise<void>;
  handleMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
  onPlayerActivitySelect: (activity: Activity) => Promise<void>;
  onPlayerSelect?: (playerId: string) => void;
}

function getCupsWithMatches(activities, players) {
  // Get all cup activities
  const cupActivities = activities.filter(activity => activity.type === 'cup');
  // Get all cup matches (matches that reference a cup)
  const cupMatches = activities.filter(activity => activity.type === 'match' && (activity.cupId || activity.cupName));
  const cupsWithMatches = [];
  cupActivities.forEach(cupActivity => {
    const relatedMatches = cupMatches.filter(match => match.cupId === cupActivity.id || match.cupName === cupActivity.name);
    // Statistik: vinster, oavgjorda, förluster, mål, assist, deltagare
    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0, assists = 0;
    const participantSet = new Set();
    relatedMatches.forEach(match => {
      if (match.homeScore !== undefined && match.awayScore !== undefined && match.homeScore === match.awayScore) {
        draws++;
      } else if (match.isWin === true) {
        wins++;
      } else if (match.isWin === false) {
        losses++;
      }
      // Dela upp mål i gjorda och insläppta (utgår från homeScore = våra mål)
      if (typeof match.homeScore === 'number') {
        goalsFor += match.homeScore;
      }
      if (typeof match.awayScore === 'number') {
        goalsAgainst += match.awayScore;
      }
      // Summera assist som tidigare
      if (match.player_stats && match.player_stats.assists) {
        assists += Number(Object.values(match.player_stats.assists).reduce((a, b) => Number(a) + Number(b), 0));
      }
      // Samla deltagare
      if (Array.isArray(match.participants)) {
        match.participants.forEach(pid => participantSet.add(pid));
      }
    });
    cupsWithMatches.push({
      ...cupActivity,
      matches: relatedMatches,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      assists,
      numParticipants: participantSet.size
    });
  });
  return cupsWithMatches;
}

function CupsPage({ activities, players, onActivitySelect, onPlayerSelect }) {
  const isMobile = useIsMobile();
  let cupsWithMatches = getCupsWithMatches(activities, players);
  // Sort cups by date descending (latest first)
  cupsWithMatches = cupsWithMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (cupsWithMatches.length === 0) {
    return <div className="p-8 text-center text-lg">Inga cuper hittades.</div>;
  }
  return (
    <div className="space-y-4">
      {cupsWithMatches.map(cup => (
        <Card key={cup.id} className="transition-shadow hover:shadow-lg rounded-xl border border-gray-200">
          <Accordion type="multiple" className="w-full" defaultValue={[]}>
            <AccordionItem value={cup.id} className="border-0">
              <AccordionTrigger className="w-full flex justify-between items-center px-6 py-4 text-lg font-bold bg-white rounded-xl group">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{cup.name}</span>
                  <span className="flex items-center text-xs text-gray-500 gap-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {cup.date ? new Date(cup.date).toLocaleDateString() : ""}
                  </span>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-yellow-500" /><span className="font-semibold">Matcher:</span> {cup.matches.length}</div>
                    <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-green-600" /><span className="font-semibold">Gjorda mål:</span> {cup.goalsFor}</div>
                    <div className="flex items-center gap-1"><Trophy className="h-4 w-4 text-red-600" /><span className="font-semibold">Insläppta mål:</span> {cup.goalsAgainst}</div>
                    <div className="flex items-center gap-1"><UserPlus className="h-4 w-4 text-blue-600" /><span className="font-semibold">Assist:</span> {cup.assists}</div>
                    <div className="flex items-center gap-1"><Users className="h-4 w-4 text-purple-600" /><span className="font-semibold">Deltagare:</span> {cup.numParticipants}</div>
                    <div className="flex items-center gap-1"><span className="font-semibold">Vinster:</span> {cup.wins}</div>
                    <div className="flex items-center gap-1"><span className="font-semibold">Oavgjorda:</span> {cup.draws}</div>
                    <div className="flex items-center gap-1"><span className="font-semibold">Förluster:</span> {cup.losses}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    <Trophy className="h-4 w-4 mr-1" />
                    {cup.matches.length} matcher
                  </span>
                  <span className="transition-transform group-data-[state=open]:rotate-180 text-lg">
                    ▼
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-2">
                <ActivityListWithMonthGrouping
                  activities={cup.matches}
                  players={players}
                  onSelect={onActivitySelect}
                  onActivitySelect={onActivitySelect}
                  onPlayerSelect={onPlayerSelect}
                  isHistorical={true}
                  isMobile={isMobile}
                  noResultsMessage="Inga cupmatcher hittades"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      ))}
    </div>
  );
}

export function MainTabs({
  tabs = [
    { id: "players", label: "Spelare", icon: null },
    { id: "activities", label: "Matcher", icon: null },
    { id: "cups", label: "Cuper", icon: null },
    { id: "statistics", label: "Statistik", icon: null },
    { id: "development", label: "Utveckling", icon: null },
    { id: "training", label: "Träning", icon: null },
    { id: "team-selection", label: "Laguttagning", icon: null },
    { id: "excel", label: "Excel", icon: null },
  ],
  activeTabId,
  onTabChange,
  
  // Player state
  players,
  selectedPlayer,
  filteredPlayers,
  editingPlayer,
  searchQuery,
  selectedGrades,
  viewMode,
  setSearchQuery,
  handleGradeChange,
  setSelectedPlayer,
  setEditingPlayer,
  setViewMode,
  isAddPlayerOpen,
  setIsAddPlayerOpen,
  handlePlayerUpdate,
  handleBulkPlayerUpdate,
  handleAddPlayer,
  handleDeletePlayer,
  
  activities,
  filteredActivities,
  filteredHistoricalActivities,
  selectedActivity,
  setSelectedActivity,
  editingActivity,
  setEditingActivity,
  isAddActivityOpen,
  setIsAddActivityOpen,
  selectedActivityTypes,
  handleActivityTypeChange,
  handleActivityUpdate,
  handleKioskUpdate,
  handleDelete,
  handleImportActivities,
  handleClearHistorical,
  handleAddActivity,
  handleMatchResultUpdate,
  onPlayerActivitySelect,
  onPlayerSelect
}: MainTabsProps) {
  const isMobile = useIsMobile();
  
  const handleTabChange = (value: string) => {
    // Clear selected player and activity when switching tabs
    if (value === "players") {
      setSelectedPlayer(null);
    } else if (value === "activities") {
      setSelectedActivity(null);
    } else if (value === "statistics") {
      setSelectedPlayer(null);
      setSelectedActivity(null);
    } else if (value === "development") {
      setSelectedPlayer(null);
      setSelectedActivity(null);
    } else if (value === "training") {
      setSelectedPlayer(null);
      setSelectedActivity(null);
    } else if (value === "excel") {
      setSelectedPlayer(null);
      setSelectedActivity(null);
    } else if (value === "team-selection") {
      setSelectedPlayer(null);
      setSelectedActivity(null);
    }
    
    onTabChange(value);
    saveActiveTab(value); // Save active tab to storage
  };
  
  // Handler for player selection from activities tab
  const handlePlayerSelect = (playerId: string) => {
    console.log("MainTabs: handlePlayerSelect called with:", playerId);
    if (onPlayerSelect) {
      console.log("MainTabs: Using provided onPlayerSelect handler");
      onPlayerSelect(playerId);
    } else if (playerId) {
      console.log("MainTabs: No external handler provided, using default behavior");
      const player = players.find(p => p.id === playerId);
      if (player) {
        console.log("MainTabs: Player found:", player.name);
        setSelectedPlayer(player);
      }
    } else {
      setSelectedPlayer(null);
    }
  };

  const handleActivitySelect = (activity: Activity) => {
    console.log("MainTabs: Activity selected:", activity.id, activity.name);
    setSelectedActivity(activity);
  };

  const gradeData = React.useMemo(() => {
    const gradeMap = new Map<string, number>();
    
    players.forEach(player => {
      const grade = player.grade;
      gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1);
    });
    
    return Array.from(gradeMap.entries()).map(([grade, players]) => ({
      grade,
      players
    }));
  }, [players]);
  
  return (
    <>
      <Tabs value={activeTabId} onValueChange={handleTabChange}>
        {/* Header with tabs and action buttons */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <TabsList className="flex-1 overflow-x-auto whitespace-nowrap">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1"
                disabled={tab.disabled}
              >
                {tab.icon && tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Action buttons - now always visible for consistency */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddPlayerOpen(true)}
              size={isMobile ? "sm" : "default"}
              variant="outline"
              className={isMobile ? 'h-8 px-2' : ''}
            >
              <UserPlus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
              {isMobile ? '' : 'Lägg till spelare'}
            </Button>
            <Button
              onClick={() => setIsAddActivityOpen(true)}
              size={isMobile ? "sm" : "default"}
              className={isMobile ? 'h-8 px-2' : ''}
            >
              <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
              {isMobile ? '' : 'Lägg till aktivitet'}
            </Button>
          </div>
        </div>
        
        <TabsContent value="players" className="mt-0">
          <PlayerTabContent 
            players={players}
            activities={activities}
            selectedPlayer={selectedPlayer}
            filteredPlayers={filteredPlayers}
            searchQuery={searchQuery}
            selectedGrades={selectedGrades}
            viewMode={viewMode}
            isAddPlayerOpen={isAddPlayerOpen}
            setSearchQuery={setSearchQuery}
            handleGradeChange={handleGradeChange}
            setSelectedPlayer={setSelectedPlayer}
            setViewMode={setViewMode}
            handlePlayerUpdate={handlePlayerUpdate}
            handleBulkPlayerUpdate={handleBulkPlayerUpdate}
            handleDeletePlayer={handleDeletePlayer}
            setIsAddPlayerOpen={setIsAddPlayerOpen}
            setEditingPlayer={setEditingPlayer}
            onActivitySelect={async (activity) => {
              await onPlayerActivitySelect(activity);
            }}
          />
        </TabsContent>
        
        <TabsContent value="activities" className="mt-0">
          <ActivityTabContent 
            players={players}
            activities={activities}
            filteredActivities={filteredActivities}
            filteredHistoricalActivities={filteredHistoricalActivities}
            selectedActivity={selectedActivity}
            selectedActivityTypes={selectedActivityTypes}
            handleActivityTypeChange={handleActivityTypeChange}
            setSelectedActivity={setSelectedActivity}
            handleActivityUpdate={handleActivityUpdate}
            handleKioskAssignmentUpdate={handleKioskUpdate}
            handleDeleteActivity={handleDelete}
            handleImportedActivities={handleImportActivities}
            handleClearHistoricalActivities={handleClearHistorical}
            setIsAddActivityOpen={setIsAddActivityOpen}
            setEditingActivity={setEditingActivity}
            isAddActivityOpen={isAddActivityOpen}
            handleMatchResultUpdate={handleMatchResultUpdate}
            onPlayerSelect={handlePlayerSelect}
          />
        </TabsContent>
        
        <TabsContent value="cups" className="mt-0">
          <CupsPage
            activities={activities}
            players={players}
            onActivitySelect={handleActivitySelect}
            onPlayerSelect={handlePlayerSelect}
          />
        </TabsContent>

        <TabsContent value="statistics" className="mt-0">
          <StatisticsTabsWrapper 
            players={players} 
            activities={activities}
            gradeData={gradeData}
            onActivitySelect={handleActivitySelect}
            onPlayerSelect={handlePlayerSelect}
          />
        </TabsContent>

        <TabsContent value="development" className="mt-0">
          <DevelopmentTabContent 
            players={players} 
            activities={activities}
            onPlayerSelect={handlePlayerSelect}
          />
        </TabsContent>

        <TabsContent value="training" className="mt-0">
          <TrainingTabContent />
        </TabsContent>

        <TabsContent value="team-selection" className="mt-0">
          <TeamSelectionPage />
        </TabsContent>

        <TabsContent value="excel" className="mt-0">
          <ExcelTabContent />
        </TabsContent>
      </Tabs>
      
      <PageDialogs 
        editingPlayer={editingPlayer}
        editingActivity={editingActivity}
        isAddPlayerOpen={isAddPlayerOpen}
        isAddActivityOpen={isAddActivityOpen}
        setEditingPlayer={setEditingPlayer}
        setEditingActivity={setEditingActivity}
        setIsAddPlayerOpen={setIsAddPlayerOpen}
        setIsAddActivityOpen={setIsAddActivityOpen}
        handlePlayerUpdate={handlePlayerUpdate}
        handleActivityUpdate={handleActivityUpdate}
        handleAddPlayer={handleAddPlayer}
        handleAddActivity={handleAddActivity}
        players={players}
      />
    </>
  );
}
