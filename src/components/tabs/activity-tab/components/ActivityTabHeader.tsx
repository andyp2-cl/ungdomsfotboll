
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, BarChart3 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ActivityTabHeaderProps {
  activeView: "upcoming" | "historical" | "statistics";
  handleViewChange: (value: string) => void;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  isMobile?: boolean;
}

export function ActivityTabHeader({
  activeView,
  handleViewChange,
  setIsAddActivityOpen,
  isMobile = false
}: ActivityTabHeaderProps) {
  return (
    <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'}`}>
      <div className={isMobile ? 'w-full overflow-x-auto pb-2' : ''}>
        <ToggleGroup 
          type="single" 
          value={activeView} 
          onValueChange={handleViewChange}
          className={`justify-start ${isMobile ? 'w-full flex' : ''}`}
        >
          <ToggleGroupItem 
            value="upcoming" 
            aria-label="Kommande aktiviteter"
            className={isMobile ? 'flex-1 py-1.5 px-2 text-xs' : ''}
          >
            <Calendar className={isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'} />
            {isMobile ? 'Kommande' : 'Kommande aktiviteter'}
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="historical" 
            aria-label="Historiska aktiviteter"
            className={isMobile ? 'flex-1 py-1.5 px-2 text-xs' : ''}
          >
            <Clock className={isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'} />
            {isMobile ? 'Historik' : 'Historiska aktiviteter'}
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="statistics" 
            aria-label="Statistik"
            className={isMobile ? 'flex-1 py-1.5 px-2 text-xs' : ''}
          >
            <BarChart3 className={isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'} />
            {isMobile ? 'Statistik' : 'Statistik'}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <Button onClick={() => setIsAddActivityOpen(true)} className={isMobile ? 'w-full' : ''}>
        <Plus className="h-4 w-4 mr-2" />
        Lägg till aktivitet
      </Button>
    </div>
  );
}
