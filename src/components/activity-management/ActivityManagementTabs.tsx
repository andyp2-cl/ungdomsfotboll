import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity as ActivityIcon, Database, History } from "lucide-react";

interface ActivityManagementTabsProps {
  activeTab: "activities" | "historical" | "tools" | "logs";
  setActiveTab: (tab: "activities" | "historical" | "tools" | "logs") => void;
  children: React.ReactNode;
}

const validTabs = ["activities", "historical", "tools", "logs"] as const;
type ActivityTabType = typeof validTabs[number];

const ACTIVITY_TAB_KEY = "football-app-activity-tab";

export function ActivityManagementTabs({
  activeTab,
  setActiveTab,
  children
}: ActivityManagementTabsProps) {
  // Spara och återställ aktiv tab i localStorage
  const [internalTab, setInternalTab] = useState<ActivityTabType>(() => {
    const stored = localStorage.getItem(ACTIVITY_TAB_KEY);
    return validTabs.includes(stored as ActivityTabType) ? (stored as ActivityTabType) : (activeTab || "activities");
  });

  useEffect(() => {
    setActiveTab(internalTab);
    localStorage.setItem(ACTIVITY_TAB_KEY, internalTab);
    // eslint-disable-next-line
  }, [internalTab]);

  return (
    <Tabs value={internalTab} onValueChange={tab => setInternalTab(tab as ActivityTabType)}>
      <TabsList className="mb-6">
        <TabsTrigger value="activities">
          <ActivityIcon className="h-4 w-4 mr-2" />
          Aktiviteter
        </TabsTrigger>
        <TabsTrigger value="historical">
          <History className="h-4 w-4 mr-2" />
          Tidigare aktiviteter
        </TabsTrigger>
        <TabsTrigger value="tools">
          Verktyg
        </TabsTrigger>
        <TabsTrigger value="logs">
          <Database className="h-4 w-4 mr-2" />
          Databaslogg
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
