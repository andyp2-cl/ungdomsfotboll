import { useState } from 'react';
import { Activity, PlayerStats } from '@/types/player';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

interface ResultSaverProps {
  activity: Activity;
  homeScore: number | undefined;
  awayScore: number | undefined;
  isWin: boolean | undefined;
  onSaved: () => void;
  onCancel: () => void;
}

export const useResultSaver = ({ 
  activity,
  updateActivity,
  onMatchResultUpdate
}: { 
  activity: Activity, 
  updateActivity: (updatedActivity: Activity) => void,
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>
}) => {
  const { toast } = useToast();

  const saveMatchResult = async (
    homeScore?: number, 
    awayScore?: number, 
    isWin?: boolean
  ) => {
    try {
      // Only continue if both scores are provided
      if (homeScore === undefined || awayScore === undefined) {
        toast({
          title: 'Fel',
          description: 'Båda hemma- och bortaresultat måste anges',
          variant: 'destructive',
        });
        return;
      }
      
      // Format the result string
      const result = `${homeScore}-${awayScore}`;
      
      // Create updated player_stats with type safety
      const currentPlayerStats = activity.player_stats || {
        goals: {},
        assists: {}
      };
      
      // Create the updated activity
      const updatedActivity: Activity = {
        ...activity,
        result,
        homeScore,
        awayScore,
        isWin,
        player_stats: currentPlayerStats
      };
      
      // Update the local activity in state
      updateActivity(updatedActivity);
      
      // Call the onMatchResultUpdate callback if provided
      if (onMatchResultUpdate) {
        await onMatchResultUpdate(activity.id, homeScore, awayScore);
      }
      
      toast({
        title: 'Resultat sparat',
        description: 'Matchen har uppdaterats med nytt resultat',
      });
      
      return updatedActivity;
    } catch (error: any) {
      toast({
        title: 'Ett fel inträffade',
        description: error.message || 'Kunde inte spara resultatet',
        variant: 'destructive',
      });
      console.error('Error saving match result:', error);
      throw error;
    }
  };

  return { saveMatchResult };
};

export default function ResultSaver({
  activity,
  homeScore,
  awayScore,
  isWin,
  onSaved,
  onCancel,
}: ResultSaverProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (homeScore === undefined || awayScore === undefined) {
      toast({
        title: 'Fel',
        description: 'Båda hemma- och bortaresultat måste anges',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const result = `${homeScore}-${awayScore}`;

      const currentPlayerStats = activity.player_stats || { 
        goals: {}, 
        assists: {} 
      };

      const { error } = await supabase
        .from('activities')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          is_win: isWin,
          result,
          player_stats: currentPlayerStats
        })
        .eq('id', activity.id);

      if (error) {
        throw error;
      }

      const updatedActivity: Activity = {
        ...activity,
        result,
        homeScore,
        awayScore,
        isWin,
        player_stats: currentPlayerStats
      };

      onSaved();

      toast({
        title: 'Resultat sparat',
        description: 'Matchen har uppdaterats med nytt resultat',
      });
    } catch (error: any) {
      toast({
        title: 'Ett fel inträffade',
        description: error.message || 'Kunde inte spara resultatet',
        variant: 'destructive',
      });
      console.error('Error saving match result:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <Button
        onClick={handleSave}
        disabled={isSaving || homeScore === undefined || awayScore === undefined}
        className="flex-1"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sparar...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" /> Spara resultat
          </>
        )}
      </Button>
      <Button variant="outline" onClick={onCancel} disabled={isSaving}>
        Avbryt
      </Button>
    </div>
  );
}
