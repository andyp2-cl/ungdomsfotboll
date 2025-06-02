
import React from "react";
import { Users, Activity, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  {
    id: "players",
    label: "Spelare",
    icon: Users,
  },
  {
    id: "activities", 
    label: "Aktiviteter",
    icon: Activity,
  },
  {
    id: "statistics",
    label: "Statistik", 
    icon: BarChart3,
  },
];

export function MobileNavBar({ activeTab, onTabChange }: MobileNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-pb">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200 touch-manipulation",
                "min-h-[56px] active:scale-95",
                isActive
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-label={item.label}
              role="tab"
              aria-selected={isActive}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 mb-1 transition-transform",
                  isActive && "scale-110"
                )} 
              />
              <span className="text-xs font-medium leading-none truncate">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
