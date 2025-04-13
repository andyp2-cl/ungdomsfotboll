
import React from "react";

interface ActivityTabViewContentProps {
  activeView: "upcoming" | "historical" | "statistics";
  renderContent: () => React.ReactNode;
}

export function ActivityTabViewContent({
  activeView,
  renderContent
}: ActivityTabViewContentProps) {
  return (
    <div className="activity-tab-content">
      {renderContent()}
    </div>
  );
}
