
import React from "react";
import { Activity } from "@/types/player";
import { FileImport } from "@/components/FileImport";
import { MatchScraper } from "@/components/MatchScraper";

interface ToolsTabContentProps {
  onImportedActivities: (importedActivities: Activity[]) => void;
  onMatchesScraped: (newActivities: Activity[], clearExisting?: boolean) => void;
}

export function ToolsTabContent({
  onImportedActivities,
  onMatchesScraped
}: ToolsTabContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FileImport onActivitiesImported={onImportedActivities} />
      <MatchScraper 
        onMatchesScraped={onMatchesScraped} 
      />
    </div>
  );
}
