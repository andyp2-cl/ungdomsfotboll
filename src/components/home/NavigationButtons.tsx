
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Calendar } from "lucide-react";

export const NavigationButtons = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <Link to="/players" className="w-full">
        <Button size="lg" className="w-full gap-2 h-16">
          <Users className="h-5 w-5" />
          Spelare
        </Button>
      </Link>
      
      <Link to="/activities" className="w-full">
        <Button size="lg" className="w-full gap-2 h-16">
          <Calendar className="h-5 w-5" />
          Aktiviteter
        </Button>
      </Link>
    </div>
  );
};
