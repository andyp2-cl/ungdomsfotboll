import React from "react";
import { Activity, Player } from "@/types/player";
import { ActivityParticipantSection } from "./ActivityParticipantSection";
import { ActivityStatsSection } from "./ActivityStatsSection";
import { ActivityCupMatches } from "./ActivityCupMatches";
import { LinkExistingMatchesModal } from "./LinkExistingMatchesModal";
import { LinkedMatchesList } from "./LinkedMatchesList";
import { ParticipantsList } from "./ParticipantsList";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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

  // Handle direct updates to the activity
  const updateActivity = (updatedActivity: Activity) => {
    onActivityUpdate(updatedActivity);
  };

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
    <div className="space-y-6">
      {/* If this is a cup match, show link to parent cup */}
      {parentCup && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Trophy className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Denna match är del av cupen
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => onActivitySelect?.(parentCup)}
          >
            {parentCup.name}
          </Button>
        </div>
      )}
      
      {/* For cup type activities, show cup-specific content */}
      {activity.type === "cup" && (
        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matches">Matcher</TabsTrigger>
            <TabsTrigger value="participants">Deltagare</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matches" className="space-y-4">
            <LinkedMatchesList 
              linkedMatches={linkedMatches}
              onActivitySelect={onActivitySelect}
              onUnlinkMatch={handleUnlinkMatch}
            />
            
            <LinkExistingMatchesModal 
              cupActivity={activity}
              allActivities={allActivities}
              onLinkMatches={handleLinkMatches}
            />
          </TabsContent>
          
          <TabsContent value="participants">
            <ActivityParticipantSection 
              activity={activity}
              players={players}
              updateActivity={updateActivity}
              onPlayerSelect={onPlayerSelect}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* For match type activities, show standard content */}
      {activity.type === "match" && (
        <>
          {/* Participant section */}
          <ActivityParticipantSection 
            activity={activity}
            players={players}
            updateActivity={updateActivity}
            onPlayerSelect={onPlayerSelect}
          />
          
          {/* Stats section for matches */}
          <ActivityStatsSection 
            activity={activity}
            players={players}
            participatingPlayers={participatingPlayers}
            updateActivity={updateActivity}
            isHistorical={isHistorical}
          />
        </>
      )}

      {/* Related activities - ONLY show for matches, not for cups */}
      {activity.type === "match" && relatedActivities.length > 0 && (
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-semibold mb-3">Relaterade aktiviteter</h3>
          <ul className="space-y-2">
            {relatedActivities.map(activity => (
              <li 
                key={activity.id}
                onClick={() => onActivitySelect?.(activity)}
                className="cursor-pointer hover:bg-gray-50 p-2 rounded-md flex items-center justify-between"
              >
                <div>
                  {activity.name} - {new Date(activity.date).toLocaleDateString()}
                  {activity.homeScore !== undefined && activity.awayScore !== undefined && (
                    <span className="ml-2 font-medium">
                      {activity.homeScore}-{activity.awayScore}
                    </span>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
