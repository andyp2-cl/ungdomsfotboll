
import { ReactNode, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { saveActiveTab } from "@/utils/storage";

interface MainTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  playersContent: ReactNode;
  activitiesContent: ReactNode;
}

export function MainTabs({ 
  activeTab, 
  setActiveTab, 
  playersContent, 
  activitiesContent 
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
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
        <TabsTrigger value="players">Spelare</TabsTrigger>
        <TabsTrigger value="activities">Matcher</TabsTrigger>
      </TabsList>
      
      <TabsContent value="players" className="space-y-6">
        {playersContent}
      </TabsContent>
      
      <TabsContent value="activities" className="space-y-6">
        {activitiesContent}
      </TabsContent>
    </Tabs>
  );
}
