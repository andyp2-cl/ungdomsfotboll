
import { ActivityType } from "@/types/player";
import { useFormStateManager } from "./useFormStateManager";
import { useActivityData } from "./useActivityData";
import { useActivitySubmission } from "./useActivitySubmission";
import { format } from "date-fns";

interface UseAddActivityFormProps {
  onSave: (activity: any) => void;
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
  // Get form state and handlers using the reusable manager
  const formState = useFormStateManager({
    onTypeChange,
    onDateChange: (date) => {
      // Format the date for the parent component if needed
      if (onDateChange && date) {
        onDateChange(format(new Date(date), 'yyyy-MM-dd'));
      }
    }
  });
  
  // Fetch activity data (cups and leagues)
  const { activities, cupNames, leagues, activitiesLoading, leaguesLoading } = useActivityData();
  
  // Set up submission handling
  const { isSaving, handleSave } = useActivitySubmission({
    onSave,
    activities
  });

  // Create a wrapper for the save handler that passes the current form state
  const saveActivity = async () => {
    const result = await handleSave(formState);
    return result.success;
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
