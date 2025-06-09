
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import { shareMatchCardAsImage } from '@/utils/shareMatchCard';
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
  const { toast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!navigator.clipboard) {
      toast({
        title: "Delning ej tillgänglig",
        description: "Din webbläsare stöder inte delning till urklipp.",
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
          description: "Matchkortet har kopierats som bild till urklippet.",
        });
      } else {
        throw new Error('Failed to share');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Kunde inte dela",
        description: "Ett fel uppstod när matchkortet skulle kopieras.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={isSharing}
      className={className}
      title="Dela matchkort som bild"
    >
      <Share className="h-4 w-4" />
    </Button>
  );
}
