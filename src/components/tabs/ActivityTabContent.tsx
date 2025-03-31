
import { useState } from "react";
import { Activity, ActivityType, Player } from "@/types/player";
import { SearchInput } from "@/components/SearchInput";
import { ActivityFilter } from "@/components/ActivityFilter";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar, Clock, List, Plus, Trash2 } from "lucide-react";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDetail } from "@/components/ActivityDetail";
import { Button } from "@/components/ui/button";
import { CupMatchesForm } from "@/components/CupMatchesForm";
import { MatchScraper } from "@/components/MatchScraper";
import { FileImport } from "@/components/FileImport";

interface ActivityTabContentProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: ActivityType[];
  filteredActivities: Activity[];
  filteredHistoricalActivities: Activity[];
  isAddActivityOpen: boolean;
  handleActivityTypeChange: (type: ActivityType) => void;
  setSelectedActivity: (activity: Activity | null) => void;
  handleActivityUpdate: (activity: Activity) => void;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  setEditingActivity: (activity: Activity | null) => void;
  handleKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  handleImportedActivities: (activities: Activity[]) => Promise<boolean>;
  handleScrapedMatches: (matches: Activity[]) => Promise<boolean>;
  handleClearHistoricalActivities: () => Promise<boolean>;
}

export function ActivityTabContent({
  activities,
  players,
  selectedActivity,
  selectedActivityTypes,
  filteredActivities,
  filteredHistoricalActivities,
  isAddActivityOpen,
  handleActivityTypeChange,
  setSelectedActivity,
  handleActivityUpdate,
  setIsAddActivityOpen,
  setEditingActivity,
  handleKioskAssignmentUpdate,
  handleDeleteActivity,
  handleImportedActivities,
  handleScrapedMatches,
  handleClearHistoricalActivities
}: ActivityTabContentProps) {
  const [activeView, setActiveView] = useState<"upcoming" | "historical">("upcoming");
  const [showCupForm, setShowCupForm] = useState(false);
  const [showScraperForm, setShowScraperForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <ToggleGroup type="single" value={activeView} onValueChange={(value) => {
            if (value) setActiveView(value as "upcoming" | "historical");
          }} className="justify-start">
            <ToggleGroupItem value="upcoming" aria-label="Kommande aktiviteter">
              <Calendar className="h-4 w-4 mr-2" />
              Kommande
            </ToggleGroupItem>
            <ToggleGroupItem value="historical" aria-label="Historiska aktiviteter">
              <Clock className="h-4 w-4 mr-2" />
              Historik
            </ToggleGroupItem>
          </ToggleGroup>
          
          <ActivityFilter 
            selectedTypes={selectedActivityTypes} 
            onTypeChange={handleActivityTypeChange}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setIsAddActivityOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Lägg till
          </Button>
          
          <Button variant="outline" onClick={() => setShowCupForm(!showCupForm)}>
            Lägg till cupmatcher
          </Button>
          
          <Button variant="outline" onClick={() => setShowScraperForm(!showScraperForm)}>
            Importera matcher
          </Button>
          
          <Button variant="outline" onClick={() => setShowImportForm(!showImportForm)}>
            <List className="h-4 w-4 mr-2" />
            Importera fil
          </Button>
        </div>
      </div>
      
      {showCupForm && (
        <div className="border p-4 rounded-md bg-background">
          <CupMatchesForm 
            onMatchesChange={handleImportedActivities} 
            onClose={() => setShowCupForm(false)} 
          />
        </div>
      )}
      
      {showScraperForm && (
        <div className="border p-4 rounded-md bg-background">
          <MatchScraper 
            onMatchesScraped={handleScrapedMatches}
            onClose={() => setShowScraperForm(false)}
          />
        </div>
      )}
      
      {showImportForm && (
        <div className="border p-4 rounded-md bg-background">
          <FileImport 
            onActivitiesImported={handleImportedActivities} 
            onClose={() => setShowImportForm(false)} 
          />
        </div>
      )}
      
      {selectedActivity ? (
        <ActivityDetail 
          activity={selectedActivity}
          players={players}
          onClose={() => setSelectedActivity(null)}
          onActivityUpdate={handleActivityUpdate}
          onDeleteActivity={handleDeleteActivity}
          onEdit={setEditingActivity}
          onKioskAssignmentUpdate={handleKioskAssignmentUpdate}
        />
      ) : (
        <ActivityList 
          activities={activeView === "upcoming" ? filteredActivities : filteredHistoricalActivities}
          players={players}
          onSelect={setSelectedActivity}
          isHistorical={activeView === "historical"}
        />
      )}
    </div>
  );
}
