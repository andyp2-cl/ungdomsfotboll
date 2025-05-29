
import React from "react";
import { Activity, Player } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityParticipantSection } from "./ActivityParticipantSection";
import { LinkedMatchesList } from "./LinkedMatchesList";
import { LinkExistingMatchesModal } from "./LinkExistingMatchesModal";

interface CupTabsContentProps {
  activity: Activity;
  players: Player[];
  linkedMatches: Activity[];
  allActivities: Activity[];
  onActivityUpdate: (activity: Activity) => void;
  onPlayerSelect?: (playerId: string) => void;
  onActivitySelect?: (activity: Activity) => void;
  onUnlinkMatch: (matchId: string) => Promise<void>;
  onLinkMatches: (cupId: string, matchIds: string[]) => Promise<void>;
}

export function CupTabsContent({
  activity,
  players,
  linkedMatches,
  allActivities,
  onActivityUpdate,
  onPlayerSelect,
  onActivitySelect,
  onUnlinkMatch,
  onLinkMatches
}: CupTabsContentProps) {
  const updateActivity = async (updatedActivity: Activity) => {
    await onActivityUpdate(updatedActivity);
  };

  return (
    <Tabs defaultValue="matches" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-9">
        <TabsTrigger value="matches" className="text-sm">Matcher</TabsTrigger>
        <TabsTrigger value="participants" className="text-sm">Deltagare</TabsTrigger>
      </TabsList>
      
      <TabsContent value="matches" className="space-y-3 mt-3">
        <LinkedMatchesList 
          linkedMatches={linkedMatches}
          onActivitySelect={onActivitySelect}
          onUnlinkMatch={onUnlinkMatch}
        />
        
        <LinkExistingMatchesModal 
          cupActivity={activity}
          allActivities={allActivities}
          onLinkMatches={onLinkMatches}
        />
      </TabsContent>
      
      <TabsContent value="participants" className="mt-3">
        <ActivityParticipantSection 
          activity={activity}
          players={players}
          updateActivity={updateActivity}
          onPlayerSelect={onPlayerSelect}
        />
      </TabsContent>
    </Tabs>
  );
}
