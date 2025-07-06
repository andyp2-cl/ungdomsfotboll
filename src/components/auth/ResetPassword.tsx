import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasValidTokens, setHasValidTokens] = useState(false);

  // Get and store tokens from URL immediately
  useEffect(() => {
    const getAndStoreTokens = () => {
      // Check search parameters first
      let accessToken = searchParams.get('access_token');
      let refreshToken = searchParams.get('refresh_token');
      let urlError = searchParams.get('error');
      let errorDescription = searchParams.get('error_description');
      
      // If not found in search params, check hash fragment
      if (!accessToken && !urlError) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        accessToken = params.get('access_token');
        refreshToken = params.get('refresh_token');
        urlError = params.get('error');
        errorDescription = params.get('error_description');
      }
      
      // Debug information
      console.log('=== RESET PASSWORD DEBUG ===');
      console.log('Current URL:', window.location.href);
      console.log('Search params:', window.location.search);
      console.log('Hash fragment:', window.location.hash);
      console.log('Access token found:', accessToken ? 'Yes' : 'No');
      console.log('Refresh token found:', refreshToken ? 'Yes' : 'No');
      console.log('URL error:', urlError || 'None');
      console.log('Error description:', errorDescription || 'None');
      console.log('============================');

      // Store tokens in sessionStorage if found
      if (accessToken) {
        sessionStorage.setItem('reset_access_token', accessToken);
        if (refreshToken) {
          sessionStorage.setItem('reset_refresh_token', refreshToken);
        }
        setHasValidTokens(true);
        
        // Clean up URL to remove tokens from address bar
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else {
        // Check if tokens are stored from previous load
        const storedAccessToken = sessionStorage.getItem('reset_access_token');
        if (storedAccessToken) {
          setHasValidTokens(true);
        }
      }

      // Show URL errors
      if (urlError) {
        setErrorMessage(errorDescription || 'Ett fel uppstod med återställningslänken.');
      }
    };

    getAndStoreTokens();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Validation
    if (!password || !confirmPassword) {
      setErrorMessage('Båda fälten måste fyllas i.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Lösenorden matchar inte.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Lösenordet måste vara minst 6 tecken långt.');
      setLoading(false);
      return;
    }

    // Get tokens from sessionStorage
    const accessToken = sessionStorage.getItem('reset_access_token');
    const refreshToken = sessionStorage.getItem('reset_refresh_token');

    if (!accessToken) {
      setErrorMessage('Ingen giltig återställningstoken hittades. Begär en ny återställningslänk.');
      setLoading(false);
      return;
    }

    try {
      // Check if this is demo mode
      if (accessToken === 'demo_token_123') {
        // Demo mode - simulate successful password reset
        console.log('Demo mode: Simulating password reset');
        
        // Clear demo token
        sessionStorage.removeItem('reset_access_token');
        sessionStorage.removeItem('reset_refresh_token');
        
        setSuccess(true);
        setTimeout(() => {
          alert('DEMO: Lösenordet har uppdaterats framgångsrikt!\n\nI en riktig miljö skulle du nu vara inloggad med ditt nya lösenord.');
          navigate('/');
        }, 2000);
        
        return;
      }

      // Real Supabase mode
      // Set the session using the tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || ''
      });

      if (sessionError) {
        throw sessionError;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      // Clear stored tokens
      sessionStorage.removeItem('reset_access_token');
      sessionStorage.removeItem('reset_refresh_token');

      setSuccess(true);
      setTimeout(() => {
        navigate('/players');
      }, 2000);

    } catch (error: any) {
      console.error('Reset password error:', error);
      setErrorMessage(error.message || 'Ett fel uppstod vid återställning av lösenord.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Lösenord uppdaterat!</CardTitle>
            <CardDescription>
              Ditt lösenord har uppdaterats. Du omdirigeras till appen...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Återställ lösenord</CardTitle>
          <CardDescription>
            Ange ditt nya lösenord nedan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Debug information (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-100 text-xs border rounded">
              <p><strong>Debug info:</strong></p>
              <p><strong>URL:</strong> {window.location.href}</p>
              <p><strong>Valid tokens:</strong> {hasValidTokens ? 'Yes' : 'No'}</p>
              <p><strong>Stored token:</strong> {sessionStorage.getItem('reset_access_token') ? 'Yes' : 'No'}</p>
            </div>
          )}

          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nytt lösenord</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minst 6 tecken"
                  disabled={!hasValidTokens || loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={!hasValidTokens || loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Upprepa lösenordet"
                  disabled={!hasValidTokens || loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={!hasValidTokens || loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!hasValidTokens || loading}
            >
              {loading ? 'Uppdaterar...' : 'Uppdatera lösenord'}
            </Button>
          </form>

          {!hasValidTokens && (
            <div className="mt-4 text-center space-y-4">
              <p className="text-sm text-gray-600 mb-2">
                Ingen giltig återställningstoken hittades.
              </p>
              
              {/* Demo section for testing */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800 mb-2">DEMO-läge:</p>
                <p className="text-xs text-blue-600 mb-3">
                  För att testa funktionen utan e-post, klicka på knappen nedan för att simulera en giltig återställningstoken.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Simulate having valid tokens for demo
                    sessionStorage.setItem('reset_access_token', 'demo_token_123');
                    setHasValidTokens(true);
                    alert('Demo-token aktiverad! Nu kan du testa att sätta nytt lösenord.');
                  }}
                  className="w-full mb-2"
                >
                  Aktivera demo-läge
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                Tillbaka till inloggning
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 