import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeam } from '@/hooks/useTeam';
import { CreateTeamData } from '@/types/team';
import { toast } from 'sonner';

const teamRegistrationSchema = z.object({
  name: z.string().min(2, 'Lagnamn måste vara minst 2 tecken').max(100, 'Lagnamn får inte vara längre än 100 tecken'),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Måste vara en giltig hex-färg (t.ex. #3B82F6)'),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Måste vara en giltig hex-färg (t.ex. #1E40AF)'),
  phone: z.string().optional(),
});

type TeamRegistrationFormData = z.infer<typeof teamRegistrationSchema>;

interface TeamRegistrationFormProps {
  onSuccess?: () => void;
}

export function TeamRegistrationForm({ onSuccess }: TeamRegistrationFormProps) {
  const { createTeam, loading } = useTeam();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeamRegistrationFormData>({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: {
      primary_color: '#3B82F6',
      secondary_color: '#1E40AF',
    },
  });

  const onSubmit = async (data: TeamRegistrationFormData) => {
    try {
      setIsSubmitting(true);
      
      const teamData: CreateTeamData = {
        name: data.name,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
      };

      const team = await createTeam(teamData);
      
      if (team) {
        toast.success('Lag skapat framgångsrikt! Vi kommer att granska din ansökan inom 24h.');
        reset();
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Ett fel uppstod när laget skulle skapas. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Skapa ditt lag</CardTitle>
        <CardDescription>
          Registrera ditt lag för att komma igång med Ungdomsfotboll-plattformen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Lagnamn *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="T.ex. Hässleholms IF P2014"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_color">Primär färg *</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="primary_color"
                type="color"
                {...register('primary_color')}
                className="w-16 h-10 p-1"
              />
              <Input
                {...register('primary_color')}
                placeholder="#3B82F6"
                className={errors.primary_color ? 'border-red-500' : ''}
              />
            </div>
            {errors.primary_color && (
              <p className="text-sm text-red-500">{errors.primary_color.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_color">Sekundär färg *</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="secondary_color"
                type="color"
                {...register('secondary_color')}
                className="w-16 h-10 p-1"
              />
              <Input
                {...register('secondary_color')}
                placeholder="#1E40AF"
                className={errors.secondary_color ? 'border-red-500' : ''}
              />
            </div>
            {errors.secondary_color && (
              <p className="text-sm text-red-500">{errors.secondary_color.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefonnummer (valfritt)</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="070-123 45 67"
              type="tel"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? 'Skapar lag...' : 'Skapa lag'}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Viktigt:</strong> Efter att du skapat ditt lag kommer vi att granska din ansökan. 
            Du kommer att få ett e-postmeddelande när laget har godkänts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 