
import React from "react";
import { Activity, Player } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { CupParentLink } from "./CupParentLink";
import { CupTabsContent } from "./CupTabsContent";
import { MatchContentLayout } from "./MatchContentLayout";
import { RelatedActivitiesSection } from "./RelatedActivitiesSection";

interface ActivityDetailContentProps {
  activity: Activity;
  players: Player[];
  onActivityUpdate: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  onKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
  onActivitySelect?: (activity: Activity) => void;
  relatedActivities?: Activity[];
  cupMatches?: Activity[];
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
  allActivities?: Activity[];
  onAddActivity?: (newActivity: Activity) => Promise<void>;
}

export function ActivityDetailContent({
  activity,
  players,
  onActivityUpdate,
  onPlayerSelect,
  onKioskAssignmentUpdate,
  onActivitySelect,
  relatedActivities = [],
  cupMatches = [],
  onMatchResultUpdate,
  allActivities = [],
  onAddActivity
}: ActivityDetailContentProps) {
  const { toast } = useToast();
  
  // Calculate if activity is historical
  const isHistorical = (() => {
    const activityDate = new Date(activity.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activityDate < today;
  })();
  
  // Filter players participating in this activity
  const participatingPlayers = players.filter(
    (player) => activity.participants?.includes(player.id)
  );

  // For cup matches, find the parent cup
  const parentCup = activity.cupId && allActivities 
    ? allActivities.find(a => a.id === activity.cupId) 
    : undefined;

  // Handle linking existing matches to this cup with improved logging and error handling
  const handleLinkMatches = async (cupId: string, matchIds: string[]) => {
    console.log(`ActivityDetailContent: Starting to link ${matchIds.length} matches to cup ${cupId}`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Update each match to have this cup's ID
    for (const matchId of matchIds) {
      try {
        console.log(`Linking match ${matchId} to cup ${cupId}`);
        
        const match = allActivities.find(a => a.id === matchId);
        if (match && onActivityUpdate) {
          const updatedMatch = { ...match, cupId: cupId };
          await onActivityUpdate(updatedMatch);
          successCount++;
          console.log(`Successfully linked match ${matchId} to cup`);
        } else {
          console.error(`Match ${matchId} not found or onActivityUpdate not available`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error linking match ${matchId}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Link operation completed. Success: ${successCount}, Errors: ${errorCount}`);
    
    if (errorCount > 0) {
      toast({
        title: "Delvis misslyckad koppling",
        description: `${successCount} av ${matchIds.length} matcher kopplades framgångsrikt.`,
        variant: "destructive",
      });
    }
  };

  // Handle unlinking a match from this cup
  const handleUnlinkMatch = async (matchId: string) => {
    const match = allActivities.find(a => a.id === matchId);
    if (match && onActivityUpdate) {
      const updatedMatch = { ...match, cupId: undefined };
      await onActivityUpdate(updatedMatch);
      
      toast({
        title: "Match frånkopplad",
        description: `Matchen har kopplats bort från cupen.`,
      });
    }
  };

  // Get linked matches for this cup - FIXED: use correct activity ID
  const linkedMatches = allActivities.filter(act => 
    act.cupId === activity.id && act.id !== activity.id
  );

  return (
    <div className="space-y-4">
      {/* If this is a cup match, show link to parent cup */}
      {parentCup && (
        <CupParentLink 
          parentCup={parentCup}
          onActivitySelect={onActivitySelect}
        />
      )}
      
      {/* For cup type activities, show cup-specific content */}
      {activity.type === "cup" && (
        <CupTabsContent 
          activity={activity}
          players={players}
          linkedMatches={linkedMatches}
          allActivities={allActivities}
          onActivityUpdate={onActivityUpdate}
          onPlayerSelect={onPlayerSelect}
          onActivitySelect={onActivitySelect}
          onUnlinkMatch={handleUnlinkMatch}
          onLinkMatches={handleLinkMatches}
        />
      )}

      {/* For match type activities, show optimized grid layout */}
      {activity.type === "match" && (
        <MatchContentLayout 
          activity={activity}
          players={players}
          participatingPlayers={participatingPlayers}
          isHistorical={isHistorical}
          onActivityUpdate={onActivityUpdate}
          onPlayerSelect={onPlayerSelect}
        />
      )}

      {/* Related activities - ONLY show for matches, not for cups */}
      {activity.type === "match" && (
        <RelatedActivitiesSection 
          relatedActivities={relatedActivities}
          onActivitySelect={onActivitySelect}
        />
      )}
    </div>
  );
}
