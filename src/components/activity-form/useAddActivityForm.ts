import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Activity, ActivityType } from "@/types/player";
import { getStoredActivities } from "@/utils/storage/activity/fetch";
import { getAllCupNames } from "@/lib/supabase/activities";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

// Define a League type
interface League {
  id: string;
  name: string;
  division: string;
  year: number;
}

interface AddActivityFormState {
  name: string;
  date: Date | undefined;
  type: ActivityType;
  locationName: string;
  locationDescription: string;
  locationGpsLink: string;
  time: string;
  cupName: string;
  leagueId: string;
}

interface UseAddActivityFormProps {
  onSave: (activity: Activity) => void;
  onTypeChange?: (type: ActivityType) => void;
  onDateChange?: (date: string) => void;
}

export function useAddActivityForm({ onSave, onTypeChange, onDateChange }: UseAddActivityFormProps) {
  const [formState, setFormState] = useState<AddActivityFormState>({
    name: "",
    date: new Date(),
    type: "match",
    locationName: "",
    locationDescription: "",
    locationGpsLink: "",
    time: "",
    cupName: "no-cup",
    leagueId: "none",
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch activities to get existing cup names
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => getStoredActivities({
      showToast: false,
      forceRefresh: false
    }),
  });

  // Fetch leagues from Supabase
  const { data: leagues = [], isLoading: leaguesLoading } = useQuery({
    queryKey: ["leagues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .order("year", { ascending: false })
        .order("name");
        
      if (error) {
        console.error("Error fetching leagues:", error);
        throw error;
      }
      
      return data || [];
    },
  });
  
  // Extract cup names when activities are loaded
  const [cupNames, setCupNames] = useState<string[]>([]);
  useEffect(() => {
    if (activities && activities.length > 0) {
      const names = getAllCupNames(activities);
      setCupNames(names);
    }
  }, [activities]);

  useEffect(() => {
    if (onTypeChange) {
      onTypeChange(formState.type);
    }
  }, [formState.type, onTypeChange]);

  useEffect(() => {
    if (formState.date && onDateChange) {
      onDateChange(format(formState.date, 'yyyy-MM-dd'));
    }
  }, [formState.date, onDateChange]);

  const handleInputChange = (field: keyof AddActivityFormState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (value: ActivityType) => {
    setFormState(prev => ({ ...prev, type: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormState(prev => ({ ...prev, date }));
  };

  const handleCupChange = (value: string) => {
    setFormState(prev => ({ ...prev, cupName: value }));
  };

  const handleLeagueChange = (value: string) => {
    setFormState(prev => ({ ...prev, leagueId: value }));
  };

  const handleSave = async () => {
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
    formState,
    cupNames,
    leagues,
    activitiesLoading,
    leaguesLoading,
    handleInputChange,
    handleTypeChange,
    handleDateChange,
    handleCupChange,
    handleLeagueChange,
    handleSave,
    isSaving
  };
}
