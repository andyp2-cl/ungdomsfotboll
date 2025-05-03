
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutList, History, LineChart, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Activity } from "@/types/player";

interface ActivityTabHeaderProps {
  activeView: "current" | "historical" | "statistics" | "tools";
  handleViewChange: (view: "current" | "historical" | "statistics" | "tools") => void;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  isMobile: boolean;
  onBackupClick?: () => void;
  onRestoreClick?: () => void;
  onImportClick?: () => void;
  onImportActivities?: (activities: Activity[]) => Promise<boolean>;
}

export function ActivityTabHeader({
  activeView,
  handleViewChange,
  setIsAddActivityOpen,
  onRefresh,
  isRefreshing,
  isMobile
}: ActivityTabHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
      <Tabs className="w-full sm:w-auto" value={activeView} onValueChange={(value) => handleViewChange(value as any)}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="current">
            <LayoutList className="h-4 w-4 mr-2 hidden sm:block" />
            Aktuella
          </TabsTrigger>
          <TabsTrigger value="historical">
            <History className="h-4 w-4 mr-2 hidden sm:block" />
            Historiska
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <LineChart className="h-4 w-4 mr-2 hidden sm:block" />
            Statistik
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Database className="h-4 w-4 mr-2 hidden sm:block" />
            Verktyg
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
