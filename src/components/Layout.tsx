
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MenuIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LoginStatus } from "@/components/auth/LoginStatus";
import { toast } from "sonner";

export function Layout({ 
  children,
  isCheckingAuth = false,
  isAuthenticated = false
}: { 
  children: React.ReactNode,
  isCheckingAuth?: boolean,
  isAuthenticated?: boolean
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden shrink-0">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Öppna meny</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <div className="grid gap-2 py-6">
              <div className="flex items-center justify-between">
                <Link 
                  to="/" 
                  className="flex items-center gap-2 font-semibold" 
                  onClick={() => setOpen(false)}
                >
                  <img
                    src="/lovable-uploads/283f2e70-ce59-494a-b7c5-17020cba7215.png"
                    alt="HIF Logo"
                    width={40}
                    height={40}
                  />
                  <span className="hidden md:block text-lg">Hässleholms IF P2014</span>
                  <span className="md:hidden text-lg">HIF P2014</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Stäng meny</span>
                </Button>
              </div>
              <div className="grid gap-2 pt-4">
                <Link
                  to="/"
                  className={cn(
                    "flex items-center gap-2 text-lg font-medium",
                    window.location.pathname === "/" ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setOpen(false)}
                >
                  Hem
                </Link>
                <Link
                  to="/players"
                  className={cn(
                    "flex items-center gap-2 text-lg font-medium",
                    window.location.pathname === "/players" ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setOpen(false)}
                >
                  Spelare
                </Link>
                <Link
                  to="/activities"
                  className={cn(
                    "flex items-center gap-2 text-lg font-medium",
                    window.location.pathname === "/activities" ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setOpen(false)}
                >
                  Aktiviteter
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img
            src="/lovable-uploads/283f2e70-ce59-494a-b7c5-17020cba7215.png"
            alt="HIF Logo"
            width={40}
            height={40}
          />
          <span className="hidden md:block text-lg">Hässleholms IF P2014</span>
          <span className="md:hidden text-lg">HIF P2014</span>
        </Link>
        <nav className="hidden md:flex gap-6 text-base lg:gap-10">
          <Link
            to="/"
            className={cn(
              "transition-colors hover:text-foreground",
              window.location.pathname === "/" ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            Hem
          </Link>
          <Link
            to="/players"
            className={cn(
              "transition-colors hover:text-foreground",
              window.location.pathname === "/players" ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            Spelare
          </Link>
          <Link
            to="/activities"
            className={cn(
              "transition-colors hover:text-foreground",
              window.location.pathname === "/activities" ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            Aktiviteter
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-4">
          {isCheckingAuth ? (
            <p className="text-sm text-muted-foreground">Kontrollerar anslutning...</p>
          ) : isAuthenticated ? (
            <LoginStatus />
          ) : (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => toast.info("Inloggningsfunktion kommer snart", {
                action: {
                  label: "OK",
                  onClick: () => {}
                }
              })}
            >
              Logga in
            </Button>
          )}
        </div>
      </header>
      <main className="flex-1 px-4 py-6 md:px-6 relative">
        {!isAuthenticated && !isCheckingAuth && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
            <strong>OBS!</strong> Du är inte ansluten till databasen. Viss funktionalitet kommer att vara begränsad.
          </div>
        )}
        {children}
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground sm:text-center">
          &copy; Hässleholms IF P2014. Alla rättigheter förbehållna.
        </p>
      </footer>
    </div>
  );
}
