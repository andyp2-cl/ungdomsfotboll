
import React from 'react';
import { Trophy, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

interface ActivityHeaderProps {
  name: string;
  isCupMatch: boolean;
  leagueId?: string;
  isMobileView?: boolean;
}

export function ActivityHeader({
  name,
  isCupMatch,
  leagueId,
  isMobileView = false
}: ActivityHeaderProps) {
  // Fetch league info if we have a league ID
  const { data: league } = useQuery({
    queryKey: ["league", leagueId],
    queryFn: async () => {
      if (!leagueId) return null;
      
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .eq("id", leagueId)
        .single();
        
      if (error) {
        console.error("Error fetching league:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!leagueId
  });
  
  return (
    <h3 className={`font-bold ${isMobileView ? 'text-base' : ''} flex items-center flex-wrap gap-2`}>
      {name}
      {isCupMatch && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Trophy className="h-3.5 w-3.5" />
          Cupmatch
        </Badge>
      )}
      {league && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Award className="h-3.5 w-3.5" />
          {league.name}
        </Badge>
      )}
    </h3>
  );
}
