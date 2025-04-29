
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerTabContent } from "@/components/tabs/PlayerTabContent";
import { ActivityTabContent } from "@/components/tabs/ActivityTabContent";
import { Button } from "@/components/ui/button";
import { Bold, UserCog } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { LoginStatus } from "@/components/auth/LoginStatus";

interface LayoutProps {
  activeTab?: string;
  defaultContent?: React.ReactNode;
  children?: React.ReactNode;
}

export function Layout({ activeTab = "players", defaultContent, children }: LayoutProps) {
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('fontSize') || 'default';
  });
  
  const toggleFontSize = () => {
    const newSize = fontSize === 'default' ? 'large' : 'default';
    setFontSize(newSize);
    localStorage.setItem('fontSize', newSize);
    document.documentElement.classList.toggle('text-large');
  };

  return (
    <div className={`min-h-screen bg-gray-50 p-4 ${fontSize === 'large' ? 'text-large' : ''}`}>
      <div className="max-w-[1200px] mx-auto mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Hässleholms IF</h1>
          <div className="flex items-center gap-2">
            <LoginStatus />
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFontSize}
              className="flex gap-1.5 items-center"
            >
              <Bold className="h-4 w-4" />
              <span className="text-xs">Större text</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link to="/player-management" className="flex gap-1.5 items-center">
                <UserCog className="h-4 w-4" />
                <span className="text-xs">Hantera</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Card className="mx-auto max-w-[1200px] shadow-sm">
        {children ? (
          <div className="p-4">{children}</div>
        ) : (
          <Tabs 
            defaultValue={activeTab}
            className="w-full"
          >
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="players" className="data-[state=active]:bg-primary/10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Spelare
                </TabsTrigger>
                <TabsTrigger value="activities" className="data-[state=active]:bg-primary/10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Aktiviteter
                </TabsTrigger>
                <TabsTrigger value="statistics" className="data-[state=active]:bg-primary/10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Statistik
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="players" className="p-0 border-0">
              <div className="p-6">
                <PlayerTabContent />
              </div>
            </TabsContent>
            <TabsContent value="activities" className="p-0 border-0">
              <div className="p-6">
                <ActivityTabContent />
              </div>
            </TabsContent>
            <TabsContent value="statistics" className="p-0 border-0">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Statistik</h2>
                {defaultContent}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  );
}
