
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";

interface ActivityTabHeaderProps {
  activeView: "upcoming" | "historical" | "statistics";
  handleViewChange: (value: string) => void;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  isMobile?: boolean;
  showAddPlayerButton?: boolean;
}

export function ActivityTabHeader({
  activeView,
  handleViewChange,
  setIsAddActivityOpen,
  isMobile = false,
  showAddPlayerButton = false
}: ActivityTabHeaderProps) {
  const handleAddPlayer = () => {
    // This will be handled by the parent component
    console.log("Add player clicked");
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <Tabs value={activeView} onValueChange={handleViewChange} className="flex-1">
        <TabsList className={`grid w-full grid-cols-3 ${isMobile ? 'h-8' : ''}`}>
          <TabsTrigger value="upcoming" className={isMobile ? 'text-xs px-2' : ''}>
            {isMobile ? 'Kommande' : 'Kommande'}
          </TabsTrigger>
          <TabsTrigger value="historical" className={isMobile ? 'text-xs px-2' : ''}>
            {isMobile ? 'Historik' : 'Historiska'}
          </TabsTrigger>
          <TabsTrigger value="statistics" className={isMobile ? 'text-xs px-2' : ''}>
            {isMobile ? 'Stats' : 'Statistik'}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {activeView !== "statistics" && (
        <div className="flex items-center gap-2">
          {showAddPlayerButton && (
            <Button
              onClick={handleAddPlayer}
              size={isMobile ? "sm" : "default"}
              variant="outline"
              className={isMobile ? 'h-8 px-2' : ''}
            >
              <UserPlus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
              {isMobile ? '' : 'Lägg till spelare'}
            </Button>
          )}
          <Button
            onClick={() => setIsAddActivityOpen(true)}
            size={isMobile ? "sm" : "default"}
            className={isMobile ? 'h-8 px-2' : ''}
          >
            <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
            {isMobile ? '' : 'Lägg till aktivitet'}
          </Button>
        </div>
      )}
    </div>
  );
}
