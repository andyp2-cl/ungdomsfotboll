import React, { useState } from 'react';
import { useAuth, supabase } from '@/integrations/supabase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const LoginForm: React.FC = () => {
  const { signIn, signUp, signOut, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // TEMPORÄR FUNKTION - Sätt lösenord direkt för din användare
  const handleQuickPasswordReset = async () => {
    try {
      console.log('Attempting to send reset email to a-petersson@outlook.com...');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase client initialized:', !!supabase);
      console.log('Supabase ANON KEY length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);
      
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(
        'a-petersson@outlook.com',
        { 
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      console.log('Reset password response:', { data, error: resetError });

      if (resetError) {
        console.error('Reset error details:', resetError);
        
        // Special handling for API key errors
        if (resetError.message.includes('Invalid API key') || resetError.message.includes('API key')) {
          alert('DEMO: Supabase är inte korrekt konfigurerat.\n\nI en riktig miljö skulle ett återställningsmail skickas till a-petersson@outlook.com med en länk för att återställa lösenordet.');
          return;
        }
        
        alert('Fel: ' + resetError.message);
      } else {
        console.log('Reset email sent successfully');
        alert('Återställningsmail skickat till a-petersson@outlook.com! Kolla din inkorg (och spam-mapp).');
      }
    } catch (err) {
      console.error('Quick reset error:', err);
      alert('Ett fel uppstod: ' + err);
    }
  };

  // Om användaren redan är inloggad, visa logout-option
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Du är redan inloggad</h1>
          
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Inloggad som: <strong>{user.email}</strong>
            </p>
            
            {/* Temporär lösenordsåterställning */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800 mb-2">Admin-funktioner:</p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleQuickPasswordReset}
                  className="w-full"
                >
                  Skicka reset-mail till a-petersson@outlook.com
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('http://localhost:8080/reset-password', '_blank')}
                  className="w-full"
                >
                  Öppna reset-sida (för test)
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = '/players'}
                className="w-full"
              >
                Gå till appen
              </Button>
              
              <Button 
                variant="outline" 
                onClick={signOut}
                className="w-full"
              >
                Logga ut
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await signIn(email, password) as any;
    if (error) {
      setError(error.message || 'Fel vid inloggning.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte.');
      return;
    }
    
    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken.');
      return;
    }
    
    const { error } = await signUp(email, password) as any;
    if (error) {
      setError(error.message || 'Fel vid registrering.');
    } else {
      setError(null);
      setActiveTab('login');
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      // Show success message
      alert('Registrering lyckades! Du kan nu logga in.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Ange din e-postadress först.');
      return;
    }

    setResetLoading(true);
    setError('');

    try {
      console.log('Attempting to send reset email to:', resetEmail);
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase ANON KEY length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      console.log('Reset password response:', { data, error });

      if (error) {
        console.error('Reset error details:', error);
        
        // Special handling for API key errors
        if (error.message.includes('Invalid API key') || error.message.includes('API key')) {
          setError('Supabase är inte korrekt konfigurerat. Kontakta administratören för att aktivera e-postfunktioner.');
          
          // Show a demo message for testing purposes
          setTimeout(() => {
            alert(`DEMO: Återställningsmail skulle ha skickats till ${resetEmail}\n\nI en riktig miljö skulle du få ett e-postmeddelande med en länk för att återställa ditt lösenord.`);
            setActiveTab('login');
          }, 1000);
          
          return;
        }
        
        throw error;
      }

      console.log('Reset email sent successfully');
      alert('Återställningsmail skickat! Kolla din inkorg (och spam-mapp).');
      setActiveTab('login');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Ett fel uppstod vid skickandet av återställningsmail.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Hässleholms IF P2014</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Logga in</TabsTrigger>
            <TabsTrigger value="register">Registrera</TabsTrigger>
            <TabsTrigger value="reset">Glömt lösenord</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-post</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="din@email.se"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Lösenord</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Lösenord"
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loggar in...' : 'Logga in'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="reset" className="space-y-4">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">E-post</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="din@email.se"
                  autoComplete="email"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? 'Skickar...' : 'Skicka återställningsmail'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-email">E-post</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="din@email.se"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Lösenord</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minst 6 tecken"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Bekräfta lösenord</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Bekräfta lösenord"
                  autoComplete="new-password"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registrerar...' : 'Registrera konto'}
              </Button>
            </form>
            <p className="text-sm text-gray-600 text-center">
              Genom att registrera dig godkänner du att dina uppgifter används för att hantera lagets aktiviteter.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}; 