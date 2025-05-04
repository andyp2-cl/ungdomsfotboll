
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { ActivityFilter } from "@/components/ActivityFilter";
import { ActivityTabContent } from "@/components/tabs/activity-tab";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface HistoricalActivitiesContentProps {
  activities: Activity[];
  players: Player[];
  selectedActivity: Activity | null;
  selectedActivityTypes: string[];
  filteredHistoricalActivities: Activity[];
  onActivityTypeChange: (type: string) => void;
  onActivitySelect: (activity: Activity | null) => void;
  onActivityUpdate: (activity: Activity) => Promise<void>;
  onAddActivityClick: () => void;
  onEditActivityClick: (activity: Activity) => void;
  handleKioskUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  handleDeleteActivity: (activityId: string) => Promise<boolean>;
  cupMatches: Activity[];
  onClearHistoricalActivities?: () => void;
}

export function HistoricalActivitiesContent({
  activities,
  players,
  selectedActivity,
  selectedActivityTypes,
  filteredHistoricalActivities,
  onActivityTypeChange,
  onActivitySelect,
  onActivityUpdate,
  onAddActivityClick,
  onEditActivityClick,
  handleKioskUpdate,
  handleDeleteActivity,
  cupMatches,
  onClearHistoricalActivities
}: HistoricalActivitiesContentProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Wrap onActivityUpdate to ensure it returns Promise<void>
  const handleActivityUpdate = async (activity: Activity): Promise<void> => {
    await onActivityUpdate(activity);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Tidigare aktiviteter</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {onClearHistoricalActivities && (
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Ta bort tidigare aktiviteter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ta bort tidigare aktiviteter</DialogTitle>
                  <DialogDescription>
                    Detta kommer att ta bort alla tidigare aktiviteter. Denna åtgärd kan inte ångras.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                    Avbryt
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      onClearHistoricalActivities();
                      setIsConfirmDialogOpen(false);
                    }}
                  >
                    Ta bort
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <div className="w-full sm:w-auto overflow-x-auto">
            <ActivityFilter 
              selectedTypes={selectedActivityTypes}
              onTypeChange={onActivityTypeChange}
            />
          </div>
        </div>
      </div>
      
      <ActivityTabContent
        title="Tidigare aktiviteter"
        activities={activities}
        players={players}
        selectedActivity={selectedActivity}
        selectedActivityTypes={selectedActivityTypes}
        filteredActivities={filteredHistoricalActivities}
        onActivityTypeChange={onActivityTypeChange}
        onActivitySelect={onActivitySelect}
        onActivityUpdate={handleActivityUpdate}
        onAddActivityClick={onAddActivityClick}
        onEditActivityClick={onEditActivityClick}
        handleKioskUpdate={handleKioskUpdate}
        handleDeleteActivity={handleDeleteActivity}
        cupMatches={cupMatches}
      />
    </div>
  );
}
