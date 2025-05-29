
import React from "react";
import { Activity } from "@/types/player";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CupParentLinkProps {
  parentCup: Activity;
  onActivitySelect?: (activity: Activity) => void;
}

export function CupParentLink({ parentCup, onActivitySelect }: CupParentLinkProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
      <Trophy className="h-4 w-4 text-blue-600" />
      <span className="text-sm text-blue-800">
        Denna match är del av cupen
      </span>
      <Button 
        variant="outline" 
        size="sm" 
        className="h-7 text-xs"
        onClick={() => onActivitySelect?.(parentCup)}
      >
        {parentCup.name}
      </Button>
    </div>
  );
}
