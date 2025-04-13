import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, BarChart3, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileNavBar({ activeTab, onTabChange }: MobileNavBarProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  const handleNavClick = (tab: string) => {
    onTabChange(tab);
    
    if (tab === 'players') {
      navigate('/players');
    } else if (tab === 'activities') {
      navigate('/activities');
      // If we're already on the activities page but changing to activities tab,
      // make sure the tab change takes effect
      if (window.location.pathname === '/activities') {
        onTabChange('activities');
      }
    } else if (tab === 'statistics') {
      navigate('/statistics');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="grid grid-cols-4 h-16">
        <button 
          className={`flex flex-col items-center justify-center ${
            activeTab === 'players' ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => handleNavClick('players')}
        >
          <Users className="h-5 w-5 mb-1" />
          <span className="text-xs">Spelare</span>
        </button>
        <button 
          className={`flex flex-col items-center justify-center ${
            activeTab === 'activities' ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => handleNavClick('activities')}
        >
          <Calendar className="h-5 w-5 mb-1" />
          <span className="text-xs">Matcher</span>
        </button>
        <button 
          className={`flex flex-col items-center justify-center ${
            activeTab === 'statistics' ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => handleNavClick('statistics')}
        >
          <BarChart3 className="h-5 w-5 mb-1" />
          <span className="text-xs">Statistik</span>
        </button>
        <button 
          className="flex flex-col items-center justify-center text-muted-foreground"
        >
          <Menu className="h-5 w-5 mb-1" />
          <span className="text-xs">Mer</span>
        </button>
      </div>
    </div>
  );
}
