
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlayerDevelopment } from "@/types/player";

interface DevelopmentHistoryEntry {
  id: string;
  player_id: string;
  development_data: PlayerDevelopment;
  notes?: string;
  recorded_at: string;
  recorded_by?: string;
}

export function useDevelopmentHistory(playerId?: string) {
  const [history, setHistory] = useState<DevelopmentHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (playerIdToFetch: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('player_development_history')
        .select('*')
        .eq('player_id', playerIdToFetch)
        .order('recorded_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedHistory: DevelopmentHistoryEntry[] = (data || []).map(entry => ({
        ...entry,
        development_data: entry.development_data as unknown as PlayerDevelopment
      }));

      setHistory(formattedHistory);
    } catch (err) {
      console.error('Error fetching development history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch development history');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if development has significant changes (at least 0.5 points in any category)
  const hasSignificantChange = (current: PlayerDevelopment, previous: PlayerDevelopment): boolean => {
    const categories = [
      'technical', 'gameUnderstanding', 'passing', 'offensive', 'defensive', 'mentality',
      'shooting', 'crossing', 'finishing', 'creativity', 'tackling', 'interception',
      'positioning', 'heading', 'speed', 'stamina', 'strength', 'leadership', 'composure', 'workRate'
    ];

    return categories.some(category => {
      const currentValue = current[category as keyof PlayerDevelopment] || 1;
      const previousValue = previous[category as keyof PlayerDevelopment] || 1;
      return Math.abs(currentValue - previousValue) >= 0.5;
    });
  };

  const addHistoryEntry = async (
    playerIdToAdd: string, 
    developmentData: PlayerDevelopment, 
    notes?: string,
    forceAdd: boolean = false
  ) => {
    try {
      // Check if we should add this entry automatically
      if (!forceAdd) {
        const latestEntry = history[0];
        if (latestEntry && !hasSignificantChange(developmentData, latestEntry.development_data)) {
          console.log('No significant development change, skipping automatic history save');
          return;
        }
      }

      const { error: insertError } = await supabase
        .from('player_development_history')
        .insert({
          player_id: playerIdToAdd,
          development_data: developmentData as any,
          notes: notes || (forceAdd ? 'Manuell sparning' : 'Automatisk sparning vid betydande förändring'),
          recorded_at: new Date().toISOString()
        });

      if (insertError) {
        throw insertError;
      }

      // Refresh history after adding
      if (playerId === playerIdToAdd) {
        await fetchHistory(playerIdToAdd);
      }
    } catch (err) {
      console.error('Error adding development history entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to add development entry');
    }
  };

  const addManualHistoryEntry = async (
    playerIdToAdd: string, 
    developmentData: PlayerDevelopment, 
    notes?: string
  ) => {
    return addHistoryEntry(playerIdToAdd, developmentData, notes, true);
  };

  useEffect(() => {
    if (playerId) {
      fetchHistory(playerId);
    }
  }, [playerId]);

  return {
    history,
    isLoading,
    error,
    fetchHistory,
    addHistoryEntry,
    addManualHistoryEntry,
    hasSignificantChange
  };
}
