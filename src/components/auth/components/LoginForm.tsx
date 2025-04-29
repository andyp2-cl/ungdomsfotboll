
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type LoginFormProps = {
  email: string;
  setEmail: (email: string) => void;
  rememberLogin: boolean;
  setRememberLogin: (remember: boolean) => void;
  handleLogin: (e?: React.FormEvent) => Promise<void>;
  isAuthenticating: boolean;
  setShowLogin: (show: boolean) => void;
};

export function LoginForm({
  email,
  setEmail,
  rememberLogin,
  setRememberLogin,
  handleLogin,
  isAuthenticating,
  setShowLogin
}: LoginFormProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Logga in</CardTitle>
        <CardDescription>Logga in för att synkronisera ändringar till databasen</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">E-post</label>
            <Input
              id="email"
              placeholder="din.epost@exempel.se"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberLogin"
              checked={rememberLogin}
              onChange={(e) => setRememberLogin(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="rememberLogin" className="text-sm text-muted-foreground">
              Håll mig inloggad (30 dagar)
            </label>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setShowLogin(false)}>
          Avbryt
        </Button>
        <Button 
          onClick={handleLogin}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? "Skickar..." : "Skicka länk"}
        </Button>
      </CardFooter>
    </Card>
  );
}
