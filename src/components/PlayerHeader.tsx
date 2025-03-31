
import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";

export function PlayerHeader() {
  const location = useLocation();
  
  // Determine which breadcrumb items to show based on the current path
  const getBreadcrumbItems = () => {
    if (location.pathname === "/players") {
      return [{ label: "Spelare" }];
    } else if (location.pathname === "/activities") {
      return [{ label: "Aktiviteter" }];
    }
    return [];
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <Link to="/" className="text-4xl font-bold text-[#006633] hover:text-[#005522] transition-colors">
          HIF P2014
        </Link>
      </div>
      
      <Breadcrumb items={getBreadcrumbItems()} />
    </div>
  );
}
