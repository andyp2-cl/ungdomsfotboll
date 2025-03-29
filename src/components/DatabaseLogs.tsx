
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const formatEntityType = (type: string): string => {
  switch (type) {
    case 'player': return 'Spelare';
    case 'activity': return 'Aktivitet';
    case 'player_activity': return 'Spelardeltagande';
    default: return type;
  }
};

export function DatabaseLogs() {
  const [logs, setLogs] = useState<DatabaseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('database_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        setError(error.message);
        toast({
          title: "Fel vid hämtning av loggar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setLogs(data || []);
        if (data?.length === 0) {
          toast({
            title: "Inga loggar hittades",
            description: "Det finns inga databasloggar att visa ännu.",
          });
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ett fel uppstod vid hämtning av loggar.';
      setError(errorMessage);
      toast({
        title: "Fel vid hämtning av loggar",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Set up a real-time subscription to the database_logs table
    const channel = supabase
      .channel('database_logs_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'database_logs' },
        (payload) => {
          console.log('Ny logg mottagen:', payload);
          // Lägg till den nya loggen i början av listan
          setLogs(prevLogs => [payload.new as DatabaseLog, ...prevLogs.slice(0, 99)]);
          
          toast({
            title: "Ny databaslogg",
            description: `${formatAction(payload.new.action)} - ${payload.new.details?.substring(0, 50)}${payload.new.details?.length > 50 ? '...' : ''}`,
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtidsuppdatering status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Prenumeration på databasloggar aktiv');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Fel vid prenumeration på databasloggar');
          setError('Kunde inte prenumerera på realtidsuppdateringar för databasloggar.');
        }
      });

    // Avregistrera prenumerationen när komponenten avmonteras
    return () => {
      console.log('Avregistrerar prenumeration på databasloggar');
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleRefresh = () => {
    fetchLogs();
    toast({
      title: "Uppdaterar loggar",
      description: "Hämtar senaste databasloggarna...",
    });
  };

  const getBadgeVariant = (action: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (action) {
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="mt-4">Hämtar loggar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Databasloggar</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Uppdatera
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ett fel uppstod</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {logs.length === 0 && !error ? (
        <div className="bg-muted p-8 rounded-md text-center">
          <p className="text-muted-foreground">Inga loggar hittades.</p>
          <p className="text-sm text-muted-foreground mt-2">
            När ändringar görs i databasen kommer de att visas här.
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableCaption>Visar de senaste 100 händelserna i databasen</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Tid</TableHead>
                <TableHead className="w-[100px]">Händelse</TableHead>
                <TableHead className="w-[120px]">Typ</TableHead>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Detaljer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: sv })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(log.action)}>
                      {formatAction(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatEntityType(log.entity_type)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.entity_id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="max-w-md break-words">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
