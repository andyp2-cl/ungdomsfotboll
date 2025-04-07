
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { ActivityFormValues } from "./formSchema";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultFieldsProps {
  form: UseFormReturn<ActivityFormValues>;
  activityType: string;
}

export function ResultFields({ form, activityType }: ResultFieldsProps) {
  const isMobile = useIsMobile();
  
  // Only show result fields for matches
  if (activityType !== "match") {
    return null;
  }
  
  const homeScore = form.watch("homeScore");
  const awayScore = form.watch("awayScore");
  const isWin = form.watch("isWin");

  // Log form values for debugging
  console.log("Form values for match result:", { 
    homeScore, 
    awayScore, 
    isWin: isWin === undefined ? "undefined/draw" : isWin 
  });

  // Handle win status when scores change
  useEffect(() => {
    if (homeScore && awayScore && homeScore === awayScore) {
      form.setValue("isWin", undefined);
    }
  }, [homeScore, awayScore, form]);

  // Fixed: Improved radio button change handler
  const handleWinStatusChange = (value: string) => {
    console.log("Form radio changed to:", value);
    
    switch (value) {
      case "win":
        form.setValue("isWin", true);
        break;
      case "loss":
        form.setValue("isWin", false);
        break;
      case "draw":
        // Critical fix: For draw, set to undefined instead of false
        form.setValue("isWin", undefined);
        
        // If we have scores and they're not equal, make them equal
        const currentHomeScore = form.getValues("homeScore");
        const currentAwayScore = form.getValues("awayScore");
        
        if (currentHomeScore && currentAwayScore && 
            currentHomeScore !== currentAwayScore) {
          // If scores don't match, suggest equalizing them
          if (window.confirm("Vill du göra målen lika för oavgjort?")) {
            form.setValue("homeScore", currentHomeScore);
            form.setValue("awayScore", currentHomeScore);
          }
        }
        break;
    }
  };

  // Determine current radio value based on isWin
  let winStatusValue;
  if (isWin === true) {
    winStatusValue = "win";
  } else if (isWin === false) {
    winStatusValue = "loss";
  } else {
    winStatusValue = "draw";
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Matchresultat</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="homeScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hemmamål</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="Hemmamål"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value === "" ? undefined : e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="awayScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bortamål</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="Bortamål"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value === "" ? undefined : e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      <div>
        <FormLabel className="block mb-2">Matchresultat</FormLabel>
        <RadioGroup 
          value={winStatusValue} 
          onValueChange={handleWinStatusChange}
          className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-4'}`}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="win" id="win" />
            <Label htmlFor="win" className="flex items-center cursor-pointer">
              <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
              Vinst
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="draw" id="draw" />
            <Label htmlFor="draw" className="flex items-center cursor-pointer">
              <MinusCircle className="h-4 w-4 mr-1 text-gray-600" />
              Oavgjort
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="loss" id="loss" />
            <Label htmlFor="loss" className="flex items-center cursor-pointer">
              <XCircle className="h-4 w-4 mr-1 text-red-600" />
              Förlust
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
