import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { Activity } from "@/types/player";
import { toast } from "sonner";
import { FormStateData } from "./useFormState";

interface UseActivitySubmissionProps {
  onSave: (activity: Activity) => void;
  activities?: Activity[];
}

/**
 * Handles the submission logic for new activities
 */
export function useActivitySubmission({ onSave, activities = [] }: UseActivitySubmissionProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (formState: FormStateData) => {
    const { name, date, type, locationName, locationDescription, locationGpsLink, time, cupName, leagueId } = formState;
    
    if (!name || !date) {
      toast.error("Namn och datum måste fyllas i.");
      return;
    }

    setIsSaving(true);

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log(`Creating activity with date: ${formattedDate}`);
      
      const activityId = uuidv4();
      const newActivity: Activity = {
        id: activityId,
        name: name,
        date: formattedDate,
        type: type,
        location: locationName ? {
          name: locationName,
          description: locationDescription,
          gpsLink: locationGpsLink
        } : undefined,
        time: time,
        participants: [],
        matches: [],
        player_stats: {
          goals: {},
          assists: {}
        },
        leagueId: leagueId !== "none" ? leagueId : undefined
      };
      
      // Set up cup relationship for cup types or match referencing cups
      if (type === "cup") {
        newActivity.cupId = activityId; // Set cupId to this activity's ID
        // We keep cupName in memory but handle differently for database
        newActivity.cupName = name;
        console.log(`Created new cup: ${name} with ID: ${activityId}, cupId: ${activityId}`);
      } 
      // If it's a match and a cup is selected, save the cup reference
      else if (type === "match" && cupName !== "no-cup") {
        newActivity.cupName = cupName;
        
        // Try to find the cup ID from existing cups
        if (activities) {
          const matchingCup = activities.find(a => a.type === "cup" && a.name === cupName);
          if (matchingCup) {
            newActivity.cupId = matchingCup.id;
            console.log(`Linked match to cup: ${cupName} (${matchingCup.id})`);
          }
        }
      }

      console.log("Saving new activity:", JSON.stringify(newActivity));
      try {
        await onSave(newActivity);
        toast.success(`${type === "cup" ? "Cup" : "Match"} sparad!`);
      } catch (error: any) {
        console.error("Error in onSave callback:", error);
        const errorMessage = error?.message || "Det gick inte att spara aktiviteten";
        toast.error(`Det gick inte att spara aktiviteten: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error("Error saving activity:", error);
      toast.error(`Det gick inte att spara aktiviteten: ${error?.message || "Okänt fel"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSave
  };
}
