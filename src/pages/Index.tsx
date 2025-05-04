
import React from "react";
import { HomeContent } from "@/components/home/HomeContent";
import { BackupSection } from "@/components/home/BackupSection";
import { useConnectionStatus } from "@/components/home/useConnectionStatus";

const Index = () => {
  const { syncStatus, setSyncStatus, isReconnecting, isOnline } = useConnectionStatus();
  
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      <HomeContent 
        syncStatus={syncStatus}
        isReconnecting={isReconnecting}
        isOnline={isOnline}
        setSyncStatus={setSyncStatus}
      />
      
      <BackupSection />
    </div>
  );
}

export default Index;
