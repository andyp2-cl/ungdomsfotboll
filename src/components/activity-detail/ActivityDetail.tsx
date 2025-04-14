
import { Activity, Player } from "@/types/player";
import { ActivityDetailView } from "./ActivityDetailView";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CupMatchesManager } from "../cup-management/CupMatchesManager";
import { CupMatchesView } from "./CupMatchesView";
import { addCupMatches } from "@/utils/storage/activity/cupMatches";

interface ActivityDetailProps {
  activity: Activity;
  players: Player[];
  onClose: () => void;
  onBack?: () => void;
  onEdit?: (activity: Activity) => void;
  onActivityUpdate?: (updatedActivity: Activity) => Promise<void>;
  onKioskAssignmentUpdate?: (activityId: string, playerId?: string) => Promise<boolean>;
  onActivitySelect?: (activity: Activity | null) => void;
  onDeleteActivity?: (activityId: string) => Promise<boolean>;
  allActivities?: Activity[];
  relatedActivities?: Activity[];
  cupMatches?: Activity[];
  onPlayerSelect?: (playerId: string) => void;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function ActivityDetail(props: ActivityDetailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const isCup = props.activity.type === "cup";
  const matchActivities = props.cupMatches || [];
  
  const handleAddMatches = async (newMatches: Omit<Activity, 'id'>[]): Promise<void> => {
    if (!props.onActivityUpdate) return;
    
    setIsLoading(true);
    
    try {
      console.log("Adding cup matches:", newMatches.length);
      
      // Use our helper function to add cup matches
      const createdMatches = await addCupMatches(
        props.activity, 
        newMatches, 
        // Convert onActivityUpdate to return Promise<void>
        async (activity: Activity): Promise<void> => {
          if (props.onActivityUpdate) {
            await props.onActivityUpdate(activity);
            console.log("Activity updated:", activity.id);
          }
        }
      );
      
      console.log("Created matches:", createdMatches.length);
      
      toast({
        title: "Matcher tillagda",
        description: `${createdMatches.length} nya matcher har lagts till i cupen.`,
        duration: 5000
      });
      
    } catch (error) {
      console.error("Error adding cup matches:", error);
      toast({
        title: "Ett fel inträffade",
        description: "Det gick inte att lägga till matcherna. Försök igen.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render extra content for cup activities
  const renderCupContent = () => {
    if (!isCup) return null;
    
    return (
      <>
        {/* Manager för att lägga till matcher */}
        <CupMatchesManager 
          cupActivity={props.activity}
          matchActivities={matchActivities}
          onAddMatches={handleAddMatches}
          onMatchResultUpdate={props.onMatchResultUpdate}
          onEditMatch={(matchId) => {
            const match = props.allActivities?.find(a => a.id === matchId);
            if (match && props.onActivitySelect) {
              props.onActivitySelect(match);
            }
          }}
        />
        
        {/* Visa existerande cup-matcher */}
        <CupMatchesView 
          cupActivity={props.activity}
          matchActivities={matchActivities}
          onActivitySelect={props.onActivitySelect}
        />
      </>
    );
  };
  
  return (
    <ActivityDetailView 
      {...props} 
      extraContent={renderCupContent()}
    />
  );
}
