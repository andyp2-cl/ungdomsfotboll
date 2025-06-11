
import React, { useState } from 'react';
import { Player } from '@/types/player';
import { TrainingStats } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { addTrainingStats } from '@/lib/supabase/trainingStats';

interface TrainingImportProps {
  players: Player[];
}

export function TrainingImport({ players }: TrainingImportProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Filen måste innehålla en header och minst en rad data');
      }

      // Förväntat format: "Spelarnamn,Datum,Träningstyp,Närvaro,Prestanda,Anteckningar"
      const headers = lines[0].split(',').map(h => h.trim());
      const trainingData: Omit<TrainingStats, 'id' | 'createdAt' | 'updatedAt'>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(c => c.trim());
        
        if (columns.length < 4) continue; // Minst spelarnamn, datum, typ, närvaro

        const playerName = columns[0];
        const player = players.find(p => 
          p.name.toLowerCase().includes(playerName.toLowerCase()) ||
          playerName.toLowerCase().includes(p.name.toLowerCase())
        );

        if (!player) {
          console.warn(`Spelare "${playerName}" hittades inte`);
          continue;
        }

        const trainingDate = columns[1];
        const trainingType = columns[2] || '';
        const attendance = columns[3].toLowerCase() === 'ja' || columns[3].toLowerCase() === 'true' || columns[3] === '1';
        const performanceScore = columns[4] ? parseInt(columns[4]) : undefined;
        const notes = columns[5] || '';

        // Validera datum
        const parsedDate = new Date(trainingDate);
        if (isNaN(parsedDate.getTime())) {
          console.warn(`Ogiltigt datum för ${playerName}: ${trainingDate}`);
          continue;
        }

        trainingData.push({
          playerId: player.id,
          trainingDate: parsedDate.toISOString().split('T')[0], // YYYY-MM-DD format
          trainingType,
          attendance,
          performanceScore: performanceScore && performanceScore >= 1 && performanceScore <= 10 ? performanceScore : undefined,
          notes
        });
      }

      if (trainingData.length === 0) {
        throw new Error('Ingen giltig träningsdata hittades i filen');
      }

      const success = await addTrainingStats(trainingData);
      
      if (success) {
        toast({
          title: "Träningsdata importerad",
          description: `${trainingData.length} träningspass har lagts till.`,
        });
      } else {
        throw new Error('Kunde inte spara träningsdata');
      }

    } catch (error) {
      console.error('Error importing training data:', error);
      toast({
        title: "Import misslyckades",
        description: error instanceof Error ? error.message : "Ett okänt fel uppstod",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Rensa input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importera träningsstatistik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Ladda upp en CSV-fil med träningsdata. Filen ska ha följande kolumner:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Spelarnamn</strong> - Namn på spelaren</li>
              <li><strong>Datum</strong> - Träningsdatum (YYYY-MM-DD)</li>
              <li><strong>Träningstyp</strong> - T.ex. "Teknik", "Match", "Kondition"</li>
              <li><strong>Närvaro</strong> - "Ja/Nej" eller "True/False"</li>
              <li><strong>Prestanda</strong> - Betyg 1-10 (valfritt)</li>
              <li><strong>Anteckningar</strong> - Fritext (valfritt)</li>
            </ul>
          </div>

          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <Button
                variant="outline"
                disabled={isUploading}
                className="relative"
              >
                <Input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                {isUploading ? 'Laddar upp...' : 'Välj CSV-fil'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Endast CSV-filer accepteras
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Exempel på CSV-format:</h4>
            <pre className="text-xs text-blue-800 overflow-x-auto">
{`Spelarnamn,Datum,Träningstyp,Närvaro,Prestanda,Anteckningar
Erik Andersson,2024-01-15,Teknik,Ja,8,Bra förbättring av passningar
Anna Larsson,2024-01-15,Teknik,Ja,7,
Marcus Johansson,2024-01-15,Teknik,Nej,,Sjuk`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
