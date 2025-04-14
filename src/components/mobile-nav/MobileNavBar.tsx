
import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, BarChart3, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileNavBar({ activeTab, onTabChange }: MobileNavBarProps) {
  // Return null to completely remove the mobile navigation bar
  return null;
  
  // Original code removed as per user request to remove the mobile bottom navigation
}
