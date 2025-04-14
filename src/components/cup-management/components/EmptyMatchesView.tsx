
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyMatchesViewProps {
  onAddClick: () => void;
}

export function EmptyMatchesView({ onAddClick }: EmptyMatchesViewProps) {
  return (
    <div className="text-center p-8 border border-dashed rounded-md">
      <p className="text-muted-foreground">
        Inga matcher tillagda i denna cup ännu.
      </p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onAddClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        Lägg till matcher nu
      </Button>
    </div>
  );
}
