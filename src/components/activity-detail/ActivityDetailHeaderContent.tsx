
import { Activity } from "@/types/player";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Trophy, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CupMatchBadgeProps {
  cupName: string;
}

// Create a CupMatchBadge component
export function CupMatchBadge({ cupName }: CupMatchBadgeProps) {
  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-100 flex items-center gap-1">
      <Trophy className="h-3 w-3" />
      {cupName}
    </Badge>
  );
}

interface ActivityDetailHeaderContentProps {
  activity: Activity;
  isMobile?: boolean; 
}

export function ActivityDetailHeaderContent({ activity, isMobile = false }: ActivityDetailHeaderContentProps) {
  // Fetch league info if league_id is present
  const { data: league } = useQuery({
    queryKey: ["league", activity.league_id],
    queryFn: async () => {
      if (!activity.league_id) return null;
      
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .eq("id", activity.league_id)
        .single();
      
      if (error) {
        console.error("Error fetching league:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!activity.league_id,
  });
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };
  
  // Format location display
  const location = activity.location?.name || 'Plats ej angiven';
  
  // For mobile, we want a more compact layout
  const iconClass = isMobile ? "h-4 w-4" : "h-5 w-5";
  const textClass = isMobile ? "text-sm" : "text-base";
  
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 mt-1">
        {activity.type === "match" && (
          <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-100">Match</Badge>
        )}
        
        {activity.type === "cup" && (
          <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-100">Cup</Badge>
        )}
        
        {activity.type === "match" && activity.cupName && (
          <CupMatchBadge cupName={activity.cupName} />
        )}
        
        {activity.league_id && league && (
          <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-100 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {league.name}
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className={iconClass} />
          <span className={textClass}>{formatDate(activity.date)}</span>
        </div>
        
        {activity.time && (
          <div className="flex items-center gap-2">
            <Clock className={iconClass} />
            <span className={textClass}>{activity.time}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <MapPin className={iconClass} />
          <span className={textClass}>{location}</span>
        </div>
      </div>
    </div>
  );
}
