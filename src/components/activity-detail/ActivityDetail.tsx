
import { Activity, Player } from "@/types/player";
import { ActivityDetailView } from "./ActivityDetailView";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { findMatchesByCupName } from "@/lib/supabase/activities";
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
  const [cupMatches, setCupMatches] = useState<Activity[]>([]);
  const { toast } = useToast();
  
  const isCup = props.activity.type === "cup";
  const activityId = props.activity.id;
  const cupName = props.activity.name;
  
  // Find matches related to this cup by cup name
  useEffect(() => {
    if (isCup && props.allActivities) {
      const matches = findMatchesByCupName(props.allActivities, cupName);
      console.log(`Found ${matches.length} matches for cup ${cupName}`);
      setCupMatches(matches);
    }
  }, [isCup, props.allActivities, cupName]);
  
  useEffect(() => {
    console.log("ActivityDetail re-rendered with:");
    console.log("- activity:", props.activity.id, props.activity.name, props.activity.type);
    console.log("- cupMatches:", cupMatches.length);
    
    if (props.activity.type === 'cup') {
      console.log(`Cup ${props.activity.name} has ${cupMatches.length} related matches`);
    }
  }, [props.activity, cupMatches]);
  
  // Use the cup matches from our state
  const matchActivities = cupMatches;
  
  // Decide which view to render
  const renderCupContent = () => {
    if (!isCup) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Cup-relaterade matcher</h3>
        {matchActivities.length > 0 ? (
          <div className="space-y-2">
            {matchActivities.map(match => (
              <div 
                key={match.id} 
                className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => props.onActivitySelect && props.onActivitySelect(match)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{match.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(match.date).toLocaleDateString()} {match.time}
                    </p>
                  </div>
                  {match.result && (
                    <div className="text-lg font-bold">{match.result}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Inga relaterade matcher har lagts till ännu. Lägg till matcher med denna cup i cupfältet.</p>
        )}
      </div>
    );
  };
  
  return (
    <ActivityDetailView 
      {...props} 
      extraContent={renderCupContent()}
    />
  );
}
