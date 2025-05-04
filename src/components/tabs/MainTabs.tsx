
import { ReactNode, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { saveActiveTab } from "@/utils/storage";

interface MainTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  playerCount?: number;
  activityCount?: number;
  playersContent?: ReactNode;
  activitiesContent?: ReactNode;
  children?: ReactNode;
}

export function MainTabs({ 
  activeTab, 
  onTabChange, 
  playerCount,
  activityCount,
  playersContent,
  activitiesContent,
  children 
}: MainTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    saveActiveTab(activeTab);
    
    if (activeTab === "activities" && location.pathname !== "/activities") {
      navigate("/activities", { replace: true });
    } else if (activeTab === "players" && location.pathname !== "/players") {
      navigate("/players", { replace: true });
    }
  }, [activeTab, navigate, location.pathname]);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
        <TabsTrigger value="players">
          Spelare {playerCount !== undefined ? `(${playerCount})` : ''}
        </TabsTrigger>
        <TabsTrigger value="activities">
          Matcher {activityCount !== undefined ? `(${activityCount})` : ''}
        </TabsTrigger>
      </TabsList>
      
      {playersContent && <TabsContent value="players">{playersContent}</TabsContent>}
      {activitiesContent && <TabsContent value="activities">{activitiesContent}</TabsContent>}
      
      {children}
    </Tabs>
  );
}
