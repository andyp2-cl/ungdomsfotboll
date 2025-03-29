
import { useState, useEffect } from "react";
import { fetchDatabaseLogs } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Database, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

export function DatabaseLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>("table");

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDatabaseLogs(100);
      setLogs(data);
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'create':
        return 'success';
      case 'update':
        return 'default';
      case 'delete':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getEntityBadgeVariant = (entityType: string) => {
    switch (entityType) {
      case 'player':
        return 'outline';
      case 'activity':
        return 'secondary';
      case 'player_activity':
        return 'default';
      default:
        return 'outline';
    }
  };

  const exportLogs = () => {
    if (logs.length === 0) return;
    
    const jsonString = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `database-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Database className="h-5 w-5" />
          Databaslogg
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportLogs}
            disabled={logs.length === 0}
          >
            <FileText className="h-4 w-4 mr-1" />
            Exportera
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadLogs} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Uppdatera
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="table">Tabell</TabsTrigger>
            <TabsTrigger value="detail">Detaljer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Tidpunkt</TableHead>
                    <TableHead className="w-[100px]">Åtgärd</TableHead>
                    <TableHead className="w-[150px]">Entitet</TableHead>
                    <TableHead>Detaljer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        {isLoading ? 'Laddar loggar...' : 'Inga loggar hittades'}
                      </TableCell>
                    </TableRow>
                  )}
                  {logs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)} 
                      className="cursor-pointer"
                    >
                      <TableCell className="font-mono text-xs">
                        {new Date(log.timestamp).toLocaleString('sv-SE')}
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.timestamp), { 
                            addSuffix: true, 
                            locale: sv 
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action === 'create' ? 'Skapa' : 
                            log.action === 'update' ? 'Uppdatera' : 
                            log.action === 'delete' ? 'Ta bort' : 
                            log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEntityBadgeVariant(log.entity_type)}>
                          {log.entity_type === 'player' ? 'Spelare' : 
                            log.entity_type === 'activity' ? 'Aktivitet' : 
                            log.entity_type === 'player_activity' ? 'Deltagande' : 
                            log.entity_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="truncate max-w-[300px]">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="detail">
            {selectedLog ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      <Badge variant={getActionBadgeVariant(selectedLog.action)} className="mr-2">
                        {selectedLog.action === 'create' ? 'Skapa' : 
                          selectedLog.action === 'update' ? 'Uppdatera' : 
                          selectedLog.action === 'delete' ? 'Ta bort' : 
                          selectedLog.action}
                      </Badge>
                      <Badge variant={getEntityBadgeVariant(selectedLog.entity_type)}>
                        {selectedLog.entity_type === 'player' ? 'Spelare' : 
                          selectedLog.entity_type === 'activity' ? 'Aktivitet' : 
                          selectedLog.entity_type === 'player_activity' ? 'Deltagande' : 
                          selectedLog.entity_type}
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {selectedLog.entity_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">
                      {new Date(selectedLog.timestamp).toLocaleString('sv-SE')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(selectedLog.timestamp), { 
                        addSuffix: true, 
                        locale: sv 
                      })}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Detaljer</h4>
                  <div className="p-3 rounded-md bg-muted">
                    {selectedLog.details}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">JSON-data</h4>
                  <Textarea 
                    readOnly 
                    className="font-mono text-xs h-48" 
                    value={JSON.stringify(selectedLog, null, 2)} 
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Välj en logg från tabellen för att se detaljer
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
