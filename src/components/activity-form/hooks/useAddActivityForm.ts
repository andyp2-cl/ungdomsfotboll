
import { Activity, ActivityType } from "@/types/player";
import { useFormState } from "./useFormState";
import { useActivityData } from "./useActivityData";
import { useActivitySubmission } from "./useActivitySubmission";

interface UseAddActivityFormProps {
  onSave: (activity: Activity) => void;
  onTypeChange?: (type: ActivityType) => void;
  onDateChange?: (date: string) => void;
}

/**
 * Main hook for the add activity form that combines form state, 
 * data fetching, and submission handling
 */
export function useAddActivityForm({ 
  onSave, 
  onTypeChange, 
  onDateChange 
}: UseAddActivityFormProps) {
  // Get form state and handlers
  const formState = useFormState({ onTypeChange, onDateChange });
  
  // Fetch activity data (cups and leagues)
  const { activities, cupNames, leagues, activitiesLoading, leaguesLoading } = useActivityData();
  
  // Set up submission handling
  const { isSaving, handleSave } = useActivitySubmission({
    onSave,
    activities
  });

  // Create a wrapper for the save handler that passes the current form state
  const saveActivity = () => {
    return handleSave(formState);
  };

  return {
    formState,
    cupNames,
    leagues,
    activitiesLoading,
    leaguesLoading,
    handleInputChange: formState.handleInputChange,
    handleTypeChange: formState.handleTypeChange,
    handleDateChange: formState.handleDateChange,
    handleCupChange: formState.handleCupChange,
    handleLeagueChange: formState.handleLeagueChange,
    handleSave: saveActivity,
    isSaving
  };
}
