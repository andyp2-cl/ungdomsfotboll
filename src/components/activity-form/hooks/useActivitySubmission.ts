
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { Activity } from "@/types/player";
import { toast } from "sonner";
import { FormStateData } from "./useFormState";
import { validateActivity, showValidationError } from "../utils/activityValidation";
import { handleActivityError } from "../utils/errorHandling";

interface UseActivitySubmissionProps {
  onSave: (activity: Activity) => void;
  activities?: Activity[];
}

/**
 * Result of the save operation
 */
export interface SaveResult {
  success: boolean;
  activity?: Activity;
  error?: Error;
}

/**
 * Handles the submission logic for new activities with improved error handling
 */
export function useActivitySubmission({ onSave, activities = [] }: UseActivitySubmissionProps) {
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Create a new Activity object from form state
   */
  const createActivityFromFormState = (formState: FormStateData, activityId = uuidv4()): Activity => {
    const { name, date, type, locationName, locationDescription, locationGpsLink, time, cupName, leagueId } = formState;
    
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0];
    
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
    
    // Set up cup relationship for cup types
    if (type === "cup") {
      newActivity.cupId = activityId; // Set cupId to this activity's ID
      newActivity.cupName = name;
    } 
    // If it's a match and a cup is selected, save the cup reference
    else if (type === "match" && cupName !== "no-cup") {
      newActivity.cupName = cupName;
      
      // Find the cup ID from existing cups
      const matchingCup = activities.find(a => a.type === "cup" && a.name === cupName);
      if (matchingCup) {
        newActivity.cupId = matchingCup.id;
      }
    }
    
    return newActivity;
  };

  /**
   * Handles saving an activity from form state
   * @returns Promise with result of the save operation
   */
  const handleSave = async (formState: FormStateData): Promise<SaveResult> => {
    if (isSaving) {
      return { success: false, error: new Error("Already saving") };
    }

    // Validate form state
    const validationError = validateActivity(formState);
    if (validationError) {
      showValidationError(validationError);
      return { success: false, error: new Error(validationError) };
    }

    setIsSaving(true);

    try {
      console.log(`Creating activity with name: ${formState.name}, type: ${formState.type}`);
      
      const newActivity = createActivityFromFormState(formState);
      
      console.log("Saving new activity:", JSON.stringify(newActivity));
      await onSave(newActivity);
      
      toast.success(`${newActivity.type === "cup" ? "Cup" : "Match"} sparad!`);
      return { success: true, activity: newActivity };
    } catch (error) {
      const handledError = handleActivityError(
        error, 
        "Det gick inte att spara aktiviteten"
      );
      return { success: false, error: handledError };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSave
  };
}
