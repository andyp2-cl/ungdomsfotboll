
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ActivityTabHeaderProps {
  activeView: "upcoming" | "historical" | "statistics";
  handleViewChange: (value: string) => void;
  isMobile?: boolean;
}

export function ActivityTabHeader({
  activeView,
  handleViewChange,
  isMobile = false
}: ActivityTabHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Tabs value={activeView} onValueChange={handleViewChange} className="flex-1">
        <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-8' : ''}`}>
          <TabsTrigger value="upcoming" className={isMobile ? 'text-xs px-2' : ''}>
            {isMobile ? 'Kommande' : 'Kommande'}
          </TabsTrigger>
          <TabsTrigger value="historical" className={isMobile ? 'text-xs px-2' : ''}>
            {isMobile ? 'Historik' : 'Historiska'}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
