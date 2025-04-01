
import React from "react";
import { DatabaseLogs } from "@/components/DatabaseLogs";

export function DatabaseLogsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Databaslogg</h2>
      <DatabaseLogs />
    </div>
  );
}
