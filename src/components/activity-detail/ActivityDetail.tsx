
import { Activity, Player } from "@/types/player";
import { ActivityDetailView } from "./ActivityDetailView";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CupMatchesManager } from "../cup-management/CupMatchesManager";
import { CupMatchesView } from "./CupMatchesView";
import { v4 as uuidv4 } from 'uuid';

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
  
  console.log("ActivityDetail rendering with activity:", props.activity.id, props.activity.name, props.activity.type);
  console.log("Cup matches count:", matchActivities.length);
  
  if (props.activity.type === 'cup') {
    const cupId = props.activity.id;
    const matchesByReference = props.allActivities?.filter(a => a.cupId === cupId) || [];
    console.log(`Cup ${props.activity.name} has ${matchesByReference.length} matches by cupId reference`);
    
    if (props.activity.matches) {
      console.log(`Cup ${props.activity.name} has ${props.activity.matches.length} matches in its matches array`);
      const matchActivitiesById = props.allActivities?.filter(a => 
        props.activity.matches?.includes(a.id)
      ) || [];
      console.log(`Found ${matchActivitiesById.length} actual match activities from the matches array`);
    }
  }
  
  const handleAddMatches = async (newMatches: Omit<Activity, 'id'>[]): Promise<void> => {
    if (!props.onActivityUpdate) return;
    
    setIsLoading(true);
    
    try {
      console.log("Adding cup matches:", newMatches.length);
      
      // Create full Activity objects with IDs
      const activitiesWithIds = newMatches.map(match => ({
        ...match,
        id: uuidv4(), // Generate unique ID for each match
      }));
      
      // Get the current activity to update
      const updatedCupActivity = { ...props.activity };
      
      // Ensure matches array exists
      if (!updatedCupActivity.matches) {
        updatedCupActivity.matches = [];
      }
      
      // Add new match IDs to the cup's matches array
      updatedCupActivity.matches = [
        ...updatedCupActivity.matches,
        ...activitiesWithIds.map(a => a.id)
      ];
      
      console.log("Updated cup with match IDs:", updatedCupActivity.matches);
      
      // First update the cup activity to reference these new matches
      if (props.onActivityUpdate) {
        await props.onActivityUpdate(updatedCupActivity);
        console.log("Cup updated with new match references");
      }
      
      // Then create each match activity
      for (const match of activitiesWithIds) {
        console.log("Creating match:", match.id, match.name);
        if (props.onActivityUpdate) {
          await props.onActivityUpdate(match as Activity);
          console.log("Created match:", match.id, match.name);
        }
      }
      
      toast({
        title: "Matcher tillagda",
        description: `${activitiesWithIds.length} nya matcher har lagts till i cupen.`,
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
              console.log("Navigating to match:", match.id, match.name);
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
