import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";

interface DatabaseLog {
  id: string;
  timestamp: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
}

const formatAction = (action: string): string => {
  switch (action) {
    case 'create': return 'Skapad';
    case 'update': return 'Uppdaterad';
    case 'delete': return 'Borttagen';
    default: return 'Okänd';
  }
};

export function DatabaseLogs() {
  const [logs, setLogs] = useState<DatabaseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('database_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50);

        if (error) {
          setError(error.message);
        } else {
          setLogs(data || []);
        }
      } catch (err: any) {
        setError(err.message || 'Ett fel uppstod vid hämtning av loggar.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // Set up a real-time subscription to the database_logs table
    const channel = supabase
      .channel('database_logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'database_logs' },
        (payload) => {
          // When a change occurs, refresh the logs
          console.log('Change received!', payload);
          fetchLogs();
        }
      )
      .subscribe();

    // Unsubscribe when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getBadgeVariant = (action: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (action) {
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <p>Hämtar loggar...</p>;
  }

  if (error) {
    return <p className="text-red-500">Fel: {error}</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Databasloggar</h2>
      {logs.length === 0 ? (
        <p>Inga loggar hittades.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Händelse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detaljer
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: sv })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Badge variant={getBadgeVariant(log.action)} className="text-xs">
                      {formatAction(log.action)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.entity_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.entity_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
