
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share, Download } from 'lucide-react';
import { shareMatchCardAsImage } from '@/utils/shareMatchCard';
import { downloadMatchCardAsImage } from '@/utils/downloadMatchCard';
import { useToast } from '@/hooks/use-toast';

interface ShareMatchCardProps {
  targetElementId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ShareMatchCard({ 
  targetElementId, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: ShareMatchCardProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  /**
   * Försök att kopiera matchkortet som bild till urklipp.
   * Om det inte går försöker vi ladda ner bilden.
   */
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!navigator.clipboard) {
      toast({
        title: "Delning ej tillgänglig",
        description: "Din webbläsare stöder inte delning till urklipp. Du kan istället ladda ner bilden.",
        variant: "destructive"
      });
      return;
    }

    setIsSharing(true);

    try {
      const success = await shareMatchCardAsImage(targetElementId);
      if (success) {
        toast({
          title: "Matchkort kopierat",
          description: "Matchkortet har kopierats som bild till urklippet. Klistra in direkt i Messenger eller annan app.",
        });
      } else {
        throw new Error('Failed to share');
      }
    } catch (error: any) {
      console.error('Share error:', error);

      // Extra felhantering om det specifikt är "document is not focused"
      let description = "Ett fel uppstod när matchkortet skulle kopieras. Testa ladda ner bilden istället.";
      if (error && error.message && error.message.includes("Document is not focused")) {
        description = "Urklipp fungerar bara när denna sida/flik är i fokus. Gör appen aktiv och försök igen, eller ladda ner som bild.";
      }
      toast({
        title: "Kunde inte dela matchkortet",
        description,
        variant: "destructive"
      });

      // Automatiskt försök att ladda ner bilden om utklipp misslyckas
      setIsDownloading(true);
      await downloadMatchCardAsImage(targetElementId);
      setIsDownloading(false);
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Ladda ner kortet som bild till dator/mobil.
   */
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    const success = await downloadMatchCardAsImage(targetElementId);
    setIsDownloading(false);
    if (success) {
      toast({
        title: "Matchkort nedladdat",
        description: "Bilden är nedladdad – nu kan du dela den manuellt i Messenger.",
      });
    } else {
      toast({
        title: "Kunde inte ladda ner matchkortet",
        description: "Ett fel uppstod, försök igen eller kontakta support.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        disabled={isSharing}
        className={className}
        title="Dela matchkort som bild"
      >
        <Share className="h-4 w-4" />
        <span className="sr-only">Dela</span>
      </Button>
      <Button
        variant={variant}
        size={size}
        onClick={handleDownload}
        disabled={isDownloading}
        className={className}
        title="Ladda ner matchkort som bild"
      >
        <Download className="h-4 w-4" />
        <span className="sr-only">Ladda ner</span>
      </Button>
    </div>
  );
}
