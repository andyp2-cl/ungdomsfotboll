import React, { useState, useEffect } from "react";
import { Activity, ActivityType } from "@/types/player";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllCupNames } from "@/lib/supabase/activities";
import { useQuery } from "@tanstack/react-query";
import { getStoredActivities } from "@/utils/storage/activity/fetch";
import { toast } from "sonner";

interface AddActivityFormProps {
  onSave: (activity: Activity) => void;
  onCancel: () => void;
  onTypeChange?: (type: ActivityType) => void;
  onDateChange?: (date: string) => void;
}

export function AddActivityForm({ 
  onSave, 
  onCancel, 
  onTypeChange, 
  onDateChange 
}: AddActivityFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [type, setType] = useState<ActivityType>("match");
  const [locationName, setLocationName] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [locationGpsLink, setLocationGpsLink] = useState("");
  const [time, setTime] = useState("");
  const [cupName, setCupName] = useState("no-cup");
  const [cupNames, setCupNames] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch activities to get existing cup names
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: getStoredActivities,
  });
  
  // Extract cup names when activities are loaded
  useEffect(() => {
    if (activities && activities.length > 0) {
      const names = getAllCupNames(activities);
      setCupNames(names);
      console.log("Cup names loaded in AddActivityForm:", names);
    }
  }, [activities]);

  useEffect(() => {
    if (onTypeChange) {
      onTypeChange(type);
    }
  }, [type, onTypeChange]);

  useEffect(() => {
    if (date && onDateChange) {
      onDateChange(format(date, 'yyyy-MM-dd'));
    }
  }, [date, onDateChange]);

  const handleSave = async () => {
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
        }
      };
      
      // If it's a cup, set the cup name and cup ID to the activity name and activity ID
      if (type === "cup") {
        newActivity.cupName = name;
        newActivity.cupId = activityId; // Set cupId to this activity's ID
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
      } catch (error) {
        console.error("Error in onSave callback:", error);
        toast.error("Det gick inte att spara aktiviteten. Försök igen.");
      }
    } catch (error) {
      console.error("Error saving activity:", error);
      toast.error("Det gick inte att spara aktiviteten. Försök igen.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Namn</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <Label>Typ</Label>
        <RadioGroup 
          defaultValue="match" 
          className="flex gap-2" 
          onValueChange={(value) => setType(value as ActivityType)}
          value={type}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="match" id="match" />
            <Label htmlFor="match">Match</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cup" id="cup" />
            <Label htmlFor="cup">Cup</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Cup name field for match type */}
      {type === "match" && (
        <div>
          <Label htmlFor="cupName">Cup (valfritt)</Label>
          <Select 
            onValueChange={setCupName} 
            value={cupName}
            disabled={isLoading || cupNames.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Laddar cuper..." : "Välj cup eller lämna tom"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-cup">Ingen cup</SelectItem>
              {cupNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {cupNames.length === 0 && !isLoading && (
            <p className="text-xs text-muted-foreground mt-1">
              Inga cuper hittades. Skapa en cup först.
            </p>
          )}
        </div>
      )}
      
      <div>
        <Label htmlFor="date">Datum</Label>
        <DatePicker
          id="date"
          value={date}
          onSelect={setDate}
        />
      </div>
      <div>
        <Label htmlFor="time">Tid</Label>
        <Input
          type="time"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="locationName">Plats</Label>
        <Input
          id="locationName"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="locationDescription">Beskrivning av plats</Label>
        <Input
          id="locationDescription"
          value={locationDescription}
          onChange={(e) => setLocationDescription(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="locationGpsLink">GPS-länk</Label>
        <Input
          id="locationGpsLink"
          value={locationGpsLink}
          onChange={(e) => setLocationGpsLink(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Avbryt
        </Button>
        <Button 
          type="button" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Sparar..." : "Spara"}
        </Button>
      </div>
    </div>
  );
}
