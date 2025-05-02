
import React from "react";
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
                <div className="flex items-center gap-2 font-semibold">
                  <img
                    src="/lovable-uploads/283f2e70-ce59-494a-b7c5-17020cba7215.png"
                    alt="HIF Logo"
                    width={40}
                    height={40}
                  />
                  <span className="text-lg">Hässleholms IF P2014</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Stäng meny</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 font-semibold">
          <img
            src="/lovable-uploads/283f2e70-ce59-494a-b7c5-17020cba7215.png"
            alt="HIF Logo"
            width={40}
            height={40}
          />
          <span className="text-lg">Hässleholms IF P2014</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          {isCheckingAuth ? (
            <p className="text-sm text-muted-foreground">Kontrollerar anslutning...</p>
          ) : isAuthenticated ? (
            <LoginStatus />
          ) : null}
        </div>
      </header>
      <main className="flex-1 px-4 py-6 md:px-6 relative">
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
