
import { Activity, Player } from "@/types/player";
import { ActivityDetailView } from "./ActivityDetailView";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CupMatchesForm, CupMatch } from "@/components/CupMatchesForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { Plus } from "lucide-react";

interface ActivityDetailProps {
  activity: Activity;
  players: Player[];
  onClose: () => void;
  onBack?: () => void;
  onEdit?: (activity: Activity) => void;
  onActivityUpdate?: (updatedActivity: Activity) => void;
  onKioskAssignmentUpdate?: (activityId: string, playerId?: string) => void;
  onActivitySelect?: (activity: Activity | null) => void;
  onDeleteActivity?: (activityId: string) => void;
  allActivities?: Activity[];
  relatedActivities?: Activity[];
  cupMatches?: Activity[];
  onPlayerSelect?: (playerId: string) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function ActivityDetail(props: ActivityDetailProps) {
  const [isAddMatchDialogOpen, setIsAddMatchDialogOpen] = useState(false);
  const [newMatches, setNewMatches] = useState<CupMatch[]>([]);
  const { toast } = useToast();
  
  // Only show add matches button for cups
  const isCup = props.activity.type === "cup";
  
  const handleAddMatches = async () => {
    if (!props.onActivityUpdate || newMatches.length === 0) return;
    
    try {
      // Create activities for each new match
      const cupDate = props.activity.date;
      const newActivities: Activity[] = newMatches.map(match => {
        const newId = uuidv4();
        return {
          id: newId,
          name: match.name,
          date: cupDate,
          type: "match",
          time: match.time,
          location: match.location ? {
            name: match.location,
            description: match.locationDescription
          } : undefined,
          cupId: props.activity.id, // Link to the cup
          participants: [], // Start with empty participants list
        };
      });
      
      // Add the matches to the cup
      const updatedActivity = { 
        ...props.activity,
        matches: [
          ...(props.activity.matches || []),
          ...newActivities.map(a => a.id)
        ]
      };
      
      // Update the cup activity first
      await props.onActivityUpdate(updatedActivity);
      
      // Update each new match activity
      for (const activity of newActivities) {
        console.log("Saving new match activity:", activity);
        await props.onActivityUpdate(activity);
      }
      
      toast({
        title: "Matcher tillagda",
        description: `${newActivities.length} nya matcher har lagts till i cupen.`
      });
      
      // Reset and close
      setNewMatches([]);
      setIsAddMatchDialogOpen(false);
      
    } catch (error) {
      console.error("Error adding matches:", error);
      toast({
        title: "Fel",
        description: "Det gick inte att lägga till matcherna.",
        variant: "destructive"
      });
    }
  };
  
  // Add button to the component
  const AddMatchesButton = () => {
    if (!isCup) return null;
    
    return (
      <Button 
        onClick={() => setIsAddMatchDialogOpen(true)} 
        variant="outline" 
        size="sm"
        className="mt-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        Lägg till matcher
      </Button>
    );
  };
  
  return (
    <>
      <ActivityDetailView 
        {...props} 
        extraContent={<AddMatchesButton />}
      />
      
      {/* Dialog for adding matches to cup */}
      {isCup && (
        <Dialog open={isAddMatchDialogOpen} onOpenChange={setIsAddMatchDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Lägg till matcher i {props.activity.name}</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <CupMatchesForm
                cupDate={props.activity.date}
                matches={newMatches}
                onMatchesChange={setNewMatches}
              />
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddMatchDialogOpen(false)}
                >
                  Avbryt
                </Button>
                <Button 
                  onClick={handleAddMatches}
                  disabled={newMatches.length === 0}
                >
                  Lägg till {newMatches.length} matcher
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
