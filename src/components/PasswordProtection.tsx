
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole } from "lucide-react";
import { connectAnonymously } from "./auth/utils/databaseUtils";
import { setAutoConnectDatabase } from "@/utils/environment";

const PASSWORD = "tommieannatedandreas"; // Lösenord enligt önskemål
const AUTH_KEY = "hifp2014-auth";

interface PasswordProtectionProps {
  children: React.ReactNode;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDatabaseConnecting, setIsDatabaseConnecting] = useState(false);

  useEffect(() => {
    // Kontrollera om användaren redan är autentiserad
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth === "true") {
      setIsAuthenticated(true);
      
      // Automatically connect to database when already authenticated
      setIsDatabaseConnecting(true);
      connectAnonymously()
        .finally(() => setIsDatabaseConnecting(false));
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      setError("");
      
      // Enable auto-connect for database access
      setAutoConnectDatabase(true);
      
      // Connect to database automatically
      setIsDatabaseConnecting(true);
      try {
        await connectAnonymously();
      } catch (error) {
        console.error("Failed to connect to database:", error);
      } finally {
        setIsDatabaseConnecting(false);
      }
    } else {
      setError("Felaktigt lösenord. Försök igen.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Laddar...</div>;
  }

  if (isAuthenticated) {
    if (isDatabaseConnecting) {
      return <div className="min-h-screen flex items-center justify-center">Ansluter till databasen...</div>;
    }
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary/10 p-3 rounded-full">
            <LockKeyhole className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-center">Hässleholms IF P2014</h1>
        <p className="mb-6 text-gray-600 text-center">
          Denna sida är lösenordsskyddad. Vänligen ange lösenordet för att fortsätta.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <Input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ange lösenord"
                autoComplete="off"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <Button type="submit" className="w-full">
              Logga in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordProtection;
