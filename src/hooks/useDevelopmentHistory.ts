
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

      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching development history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch development history');
    } finally {
      setIsLoading(false);
    }
  };

  const addHistoryEntry = async (
    playerIdToAdd: string, 
    developmentData: PlayerDevelopment, 
    notes?: string
  ) => {
    try {
      const { error: insertError } = await supabase
        .from('player_development_history')
        .insert({
          player_id: playerIdToAdd,
          development_data: developmentData,
          notes: notes || 'Manual entry',
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
    addHistoryEntry
  };
}
