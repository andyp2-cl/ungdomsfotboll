
import { useEffect, useState } from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { StatsSection } from "./sections";
import { DeleteActivityDialog } from "./DeleteActivityDialog";
import { ActivityDetailHeaderContent } from "./ActivityDetailHeaderContent";
import { HeaderActionButtons } from "./HeaderActionButtons";
import { ParticipantsSection } from "./ParticipantsSection";
import { useActivityDetailActions } from "./hooks/useActivityDetailActions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GradeDistributionChart } from "./GradeDistributionChart";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ActivityDetailSkeleton } from "./ActivityDetailSkeleton";
import { MatchReportSection } from "./MatchReportSection";

interface ActivityDetailViewProps {
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
  extraContent?: React.ReactNode;
}

export function ActivityDetailView({ 
  activity, 
  players, 
  onClose, 
  onBack, 
  onEdit, 
  onActivityUpdate,
  onKioskAssignmentUpdate,
  onActivitySelect,
  onDeleteActivity,
  allActivities,
  relatedActivities = [],
  cupMatches = [],
  onPlayerSelect,
  onMatchResultUpdate,
  extraContent
}: ActivityDetailViewProps) {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    currentActivity,
    setCurrentActivity,
    isAddingPlayers,
    setIsAddingPlayers,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    clearParticipantsDialogOpen,
    setClearParticipantsDialogOpen,
    isHistorical,
    participatingPlayers,
    handleActivityUpdate,
    handleAddPlayers,
    handleRemovePlayer,
    handleClearAllParticipants
  } = useActivityDetailActions({
    activity,
    players,
    onActivityUpdate,
    onKioskAssignmentUpdate
  });
  
  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentActivity(activity);
    // Simulate loading time to show skeleton
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [activity, setCurrentActivity]);

  const handleDeleteActivity = async () => {
    if (onDeleteActivity) {
      const success = await onDeleteActivity(currentActivity.id);
      if (success) {
        onClose();
      }
      return success;
    }
    return false;
  };

  const handleClose = () => {
    console.log("ActivityDetailView: handleClose called");
    onClose();
  };
  
  // Create a wrapper that returns Promise<void>
  const handleActivityUpdateWrapper = async (updatedActivity: Activity): Promise<void> => {
    await handleActivityUpdate(updatedActivity);
  };
  
  const isMatch = activity.type === "match";
  const formattedDate = new Date(activity.date).toLocaleDateString('sv-SE');
  const dayOfWeek = new Date(activity.date).toLocaleDateString('sv-SE', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  if (isLoading) {
    return <ActivityDetailSkeleton />;
  }

  return (
    <ErrorBoundary>
      <Card className={`w-full flex flex-col ${isMobile ? 'mx-0 px-0 max-h-[100dvh] overflow-hidden' : 'lg:max-w-3xl mx-auto'}`}>
        <CardHeader className={isMobile ? 'px-3 py-3 border-b flex-shrink-0' : ''}>
          <div className="flex justify-between items-start gap-2">
            <ActivityDetailHeaderContent 
              activity={currentActivity}
              formattedDate={formattedDate}
              capitalizedDayOfWeek={capitalizedDayOfWeek}
              isHistorical={isHistorical}
              formatResult={() => {
                if (currentActivity.homeScore !== undefined && currentActivity.awayScore !== undefined) {
                  return `${currentActivity.homeScore}-${currentActivity.awayScore}`;
                }
                return currentActivity.result || "";
              }}
            />
            <HeaderActionButtons 
              onEdit={onEdit}
              currentActivity={currentActivity}
              onDeleteActivity={onDeleteActivity}
              isDeleteDialogOpen={isDeleteDialogOpen}
              setIsDeleteDialogOpen={setIsDeleteDialogOpen}
              handleClose={handleClose}
            />
          </div>
        </CardHeader>
        
        <ScrollArea className={`flex-grow ${isMobile ? 'h-[calc(100dvh-120px)]' : ''}`}>
          <CardContent className={`space-y-6 ${isMobile ? 'px-3 py-4 pb-32' : ''}`}>
            <ErrorBoundary fallback={
              <div className="p-4 border rounded bg-red-50 text-red-800">
                Kunde inte ladda matchstatistik.
              </div>
            }>
              {/* Only show StatsSection if the match is historical */}
              {isMatch && isHistorical && (
                <StatsSection
                  activity={currentActivity}
                  players={players}
                  participatingPlayers={participatingPlayers}
                  updateActivity={handleActivityUpdateWrapper}
                  isHistorical={isHistorical}
                />
              )}
            </ErrorBoundary>

            {/* Add Match Report Section for historical activities */}
            <ErrorBoundary fallback={
              <div className="p-4 border rounded bg-red-50 text-red-800">
                Kunde inte ladda matchreferat.
              </div>
            }>
              {isHistorical && (
                <MatchReportSection
                  activity={currentActivity}
                  updateActivity={handleActivityUpdateWrapper}
                  isHistorical={isHistorical}
                />
              )}
            </ErrorBoundary>

            <ErrorBoundary fallback={
              <div className="p-4 border rounded bg-red-50 text-red-800">
                Kunde inte ladda deltagare.
              </div>
            }>
              <ParticipantsSection 
                activity={currentActivity}
                participatingPlayers={participatingPlayers}
                isAddingPlayers={isAddingPlayers}
                setIsAddingPlayers={setIsAddingPlayers}
                clearParticipantsDialogOpen={clearParticipantsDialogOpen}
                setClearParticipantsDialogOpen={setClearParticipantsDialogOpen}
                onPlayerSelect={onPlayerSelect}
                onRemovePlayer={handleRemovePlayer}
                onClearAllParticipants={handleClearAllParticipants}
                onAddPlayers={handleAddPlayers}
                players={players}
              />
            </ErrorBoundary>
            
            <ErrorBoundary fallback={
              <div className="p-4 border rounded bg-red-50 text-red-800">
                Kunde inte ladda statistikdiagram.
              </div>
            }>
              {/* Only show grade distribution in the detailed view if we have participants */}
              {participatingPlayers.length > 0 && (
                <GradeDistributionChart
                  activity={currentActivity}
                  participatingPlayers={participatingPlayers}
                />
              )}
            </ErrorBoundary>
            
            {/* Render extra content (like cup matches) */}
            <ErrorBoundary>
              {extraContent}
            </ErrorBoundary>
          </CardContent>
        </ScrollArea>
        
        <CardFooter className={`${isMobile ? 'px-3 py-3 border-t bg-background sticky bottom-0 z-10' : ''}`}>
          <Button 
            variant="outline" 
            onClick={handleClose}
            className={isMobile ? "w-full h-11" : ""}
          >
            Stäng
          </Button>
        </CardFooter>

        <DeleteActivityDialog
          activityName={currentActivity.name}
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDelete={handleDeleteActivity}
        />
      </Card>
    </ErrorBoundary>
  );
}
