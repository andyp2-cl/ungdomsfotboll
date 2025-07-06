import { useEffect, useState } from 'react';
import { useAuth, supabase } from './auth';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        setRole(data?.role || null);
        setLoading(false);
      });
  }, [user]);

  return { role, loading };
} 