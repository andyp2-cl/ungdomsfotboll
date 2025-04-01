
import React, { useState } from "react";
import { Activity, ActivityType } from "@/types/player";
import { AddActivityForm } from "@/components/AddActivityForm";
import { CupMatch, CupMatchesForm } from "@/components/CupMatchesForm";
import { generateFootballFieldUrl } from "@/utils/locationUtils";
import { useToast } from "@/hooks/use-toast";

interface ActivityFormTabProps {
  onAddActivity: (activity: Activity) => void;
  onClose: () => void;
}

export function ActivityFormTab({ onAddActivity, onClose }: ActivityFormTabProps) {
  const [showCupMatches, setShowCupMatches] = useState(false);
  const [cupMatches, setCupMatches] = useState<CupMatch[]>([]);
  const [cupDate, setCupDate] = useState("");
  const { toast } = useToast();

  const handleActivityFormSave = (activity: Activity) => {
    if (activity.type === "cup" && showCupMatches && cupMatches.length > 0) {
      const cupActivity: Activity = {
        ...activity,
        matches: []
      };
      
      const matchActivities: Activity[] = cupMatches.map(match => ({
        id: match.id,
        name: match.name,
        date: activity.date,
        type: "match" as const,
        time: match.time,
        location: match.location ? {
          name: match.location,
          description: match.locationDescription,
          gpsLink: generateFootballFieldUrl(match.location)
        } : undefined,
        participants: [],
        cupId: cupActivity.id
      }));
      
      cupActivity.matches = matchActivities.map(match => match.id);
      
      onAddActivity(cupActivity);
      
      matchActivities.forEach(matchActivity => {
        onAddActivity(matchActivity);
      });
      
      toast({
        title: "Cup och matcher tillagda",
        description: `${activity.name} och ${matchActivities.length} matcher har lagts till.`,
      });
    } else {
      onAddActivity(activity);
    }
    
    // Reset state
    setCupMatches([]);
    setShowCupMatches(false);
    setCupDate("");
    onClose();
  };

  const handleActivityTypeChange = (type: ActivityType) => {
    setShowCupMatches(type === "cup");
  };

  const handleActivityDateChange = (date: string) => {
    setCupDate(date);
  };

  return (
    <>
      <AddActivityForm 
        onSave={handleActivityFormSave}
        onCancel={onClose}
        onTypeChange={handleActivityTypeChange}
        onDateChange={handleActivityDateChange}
      />
      
      {showCupMatches && (
        <div className="mt-4 pt-4 border-t">
          <CupMatchesForm 
            cupDate={cupDate}
            onMatchesChange={setCupMatches}
          />
        </div>
      )}
    </>
  );
}
