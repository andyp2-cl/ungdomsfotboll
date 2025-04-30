
import { Link, useLocation } from "react-router-dom";
import { Users, CalendarDays, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackupButton } from "./backup-restore/BackupButton";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ to, icon, label, isActive }: NavItemProps) {
  return (
    <Link to={to}>
      <Button
        variant={isActive ? "default" : "ghost"}
        className="flex items-center gap-2"
        size="sm"
      >
        {icon}
        {label}
      </Button>
    </Link>
  );
}

export function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname.split("/")[1] || "players";
  const date = new Date();

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-6">
          <div className="font-medium">
            Hassleholm<span className="text-primary">IF</span>
            <span className="text-xs text-muted-foreground ml-2">P2014</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <NavItem
              to="/players"
              icon={<Users className="h-4 w-4" />}
              label="Spelare"
              isActive={currentPath === "" || currentPath === "players"}
            />
            <NavItem
              to="/activities"
              icon={<CalendarDays className="h-4 w-4" />}
              label="Aktiviteter"
              isActive={currentPath === "activities"}
            />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center">
            <BackupButton />
          </div>
          
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString("sv-SE")}
          </div>
          
          <nav className="md:hidden flex items-center gap-1">
            <NavItem
              to="/players"
              icon={<Users className="h-4 w-4" />}
              label=""
              isActive={currentPath === "" || currentPath === "players"}
            />
            <NavItem
              to="/activities"
              icon={<CalendarDays className="h-4 w-4" />}
              label=""
              isActive={currentPath === "activities"}
            />
          </nav>
        </div>
      </div>
    </header>
  );
}
