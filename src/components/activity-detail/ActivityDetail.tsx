
import { Activity, Player } from "@/types/player";
import { ActivityDetailView } from "./ActivityDetailView";
import { useState, useEffect } from "react";
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
  const [localCupMatches, setLocalCupMatches] = useState<Activity[]>([]);
  const { toast } = useToast();
  
  const isCup = props.activity.type === "cup";
  const activityId = props.activity.id;
  
  // Process incoming cup matches and update local state
  useEffect(() => {
    if (isCup) {
      // First try to get matches from the props.cupMatches if available
      if (props.cupMatches && props.cupMatches.length > 0) {
        console.log("Setting local cup matches from props.cupMatches:", props.cupMatches.length);
        setLocalCupMatches(props.cupMatches);
      } 
      // Then try to find matches via props.allActivities by checking the cupId
      else if (props.allActivities) {
        const matchesWithCupId = props.allActivities.filter(a => a.cupId === activityId);
        console.log("Found matches by cupId:", matchesWithCupId.length);
        setLocalCupMatches(matchesWithCupId);
      }
    }
  }, [isCup, props.cupMatches, props.allActivities, activityId]);
  
  useEffect(() => {
    console.log("ActivityDetail re-rendered with:");
    console.log("- activity:", props.activity.id, props.activity.name, props.activity.type);
    console.log("- props.cupMatches:", props.cupMatches?.length);
    console.log("- localCupMatches:", localCupMatches.length);
    
    if (props.activity.type === 'cup') {
      // Log activity matches array
      console.log(`Cup ${props.activity.name} has matches array:`, props.activity.matches || []);
      
      // Look for matches by cupId reference
      const matchesWithCupId = props.allActivities?.filter(a => a.cupId === props.activity.id) || [];
      console.log(`Found ${matchesWithCupId.length} matches with cupId reference:`, 
        matchesWithCupId.map(m => ({id: m.id, name: m.name})));
    }
  }, [props.activity, props.cupMatches, localCupMatches, props.allActivities]);
  
  const handleAddMatches = async (newMatches: Omit<Activity, 'id'>[]): Promise<void> => {
    if (!props.onActivityUpdate) return;
    
    setIsLoading(true);
    
    try {
      console.log("Adding cup matches:", newMatches.length);
      
      // Create full Activity objects with IDs
      const activitiesWithIds = newMatches.map(match => ({
        ...match,
        id: uuidv4(), // Generate unique ID for each match
        cupId: props.activity.id, // Ensure cupId is explicitly set
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
        console.log("Creating match:", match.id, match.name, "with cupId:", match.cupId);
        if (props.onActivityUpdate) {
          await props.onActivityUpdate(match as Activity);
          console.log("Created match:", match.id, match.name);
        }
      }
      
      // Update local state with new matches
      setLocalCupMatches(prevMatches => [...prevMatches, ...activitiesWithIds as Activity[]]);
      
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
  
  // Decide which matches to display
  const matchActivities = localCupMatches.length > 0 ? localCupMatches : (props.cupMatches || []);
  
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
