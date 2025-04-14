
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
  onActivityUpdate?: (updatedActivity: Activity) => void;
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
  
  const handleAddMatches = async (newMatches: Omit<Activity, 'id'>[]) => {
    if (!props.onActivityUpdate) return;
    
    setIsLoading(true);
    
    try {
      // Använd vår nya hjälpfunktion för att lägga till cup-matcher
      const createdMatches = await addCupMatches(
        props.activity, 
        newMatches, 
        props.onActivityUpdate
      );
      
      toast({
        title: "Matcher tillagda",
        description: `${createdMatches.length} nya matcher har lagts till i cupen.`,
        duration: 5000
      });
      
      return createdMatches;
    } catch (error) {
      console.error("Error adding cup matches:", error);
      toast({
        title: "Ett fel inträffade",
        description: "Det gick inte att lägga till matcherna. Försök igen.",
        variant: "destructive",
        duration: 5000
      });
      throw error;
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
