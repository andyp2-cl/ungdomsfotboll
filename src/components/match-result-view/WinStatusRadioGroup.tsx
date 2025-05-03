
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, Circle, XCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface WinStatusRadioGroupProps {
  winStatus: boolean | undefined;
  onWinStatusChange: (status: boolean | undefined) => void;
}

export function WinStatusRadioGroup({ winStatus, onWinStatusChange }: WinStatusRadioGroupProps) {
  const isMobile = useIsMobile();

  // Determine current radio value based on winStatus
  const getWinStatusValue = () => {
    if (winStatus === true) return "win";
    if (winStatus === false) return "loss";
    return "draw";
  };

  // Handle radio button change
  const handleChange = (value: string) => {
    console.log("Win status radio changed to:", value);
    
    switch (value) {
      case "win":
        onWinStatusChange(true);
        break;
      case "loss":
        onWinStatusChange(false);
        break;
      case "draw":
        onWinStatusChange(undefined);
        break;
    }
    
    console.log(`Changed win status to: ${value}, winStatus will be: ${value === 'draw' ? 'undefined' : value === 'win'}`);
  };

  return (
    <div>
      <div className="mb-2 text-sm font-medium">Resultat:</div>
      <RadioGroup 
        value={getWinStatusValue()} 
        onValueChange={handleChange}
        className="flex flex-row gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="win" id="win" />
          <Label htmlFor="win" className="flex items-center cursor-pointer">
            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
            <span>Vinst</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="draw" id="draw" />
          <Label htmlFor="draw" className="flex items-center cursor-pointer">
            <Circle className="h-4 w-4 mr-1 text-gray-600" />
            <span>Oavgjort</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="loss" id="loss" />
          <Label htmlFor="loss" className="flex items-center cursor-pointer">
            <XCircle className="h-4 w-4 mr-1 text-red-600" />
            <span>Förlust</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
