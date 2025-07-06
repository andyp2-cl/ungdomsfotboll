import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdmin, TeamWithUsers } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'Väntar',
  approved: 'Godkänd',
  rejected: 'Avvisad',
};

export function TeamApprovalList() {
  const { teams, loading, error, approveTeam, rejectTeam, deleteTeam, getStats } = useAdmin();
  const [processingTeam, setProcessingTeam] = useState<string | null>(null);

  const handleApprove = async (teamId: string) => {
    try {
      setProcessingTeam(teamId);
      await approveTeam(teamId);
      toast.success('Lag godkänt framgångsrikt!');
    } catch (error) {
      console.error('Error approving team:', error);
      toast.error('Ett fel uppstod när laget skulle godkännas.');
    } finally {
      setProcessingTeam(null);
    }
  };

  const handleReject = async (teamId: string) => {
    try {
      setProcessingTeam(teamId);
      await rejectTeam(teamId);
      toast.success('Lag avvisat framgångsrikt!');
    } catch (error) {
      console.error('Error rejecting team:', error);
      toast.error('Ett fel uppstod när laget skulle avvisas.');
    } finally {
      setProcessingTeam(null);
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta lag? Detto går inte att ångra.')) {
      return;
    }

    try {
      setProcessingTeam(teamId);
      await deleteTeam(teamId);
      toast.success('Lag borttaget framgångsrikt!');
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Ett fel uppstod när laget skulle tas bort.');
    } finally {
      setProcessingTeam(null);
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Laddar lag...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Fel: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-sm text-gray-600">Totalt antal lag</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-gray-600">Väntar på godkännande</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-sm text-gray-600">Godkända lag</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-gray-600">Avvisade lag</p>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Alla lag</h2>
        
        {teams.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Inga lag hittades.</p>
            </CardContent>
          </Card>
        ) : (
          teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {team.name}
                      <Badge className={statusColors[team.status as keyof typeof statusColors]}>
                        {statusLabels[team.status as keyof typeof statusLabels]}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Skapat {format(new Date(team.created_at), 'PPP', { locale: sv })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: team.primary_color }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: team.secondary_color }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Tränare:</p>
                    <p className="font-medium">
                      {team.user_profiles?.[0]?.full_name || 'Namn saknas'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {team.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(team.id)}
                          disabled={processingTeam === team.id}
                        >
                          {processingTeam === team.id ? 'Godkänner...' : 'Godkänn'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(team.id)}
                          disabled={processingTeam === team.id}
                        >
                          {processingTeam === team.id ? 'Avvisar...' : 'Avvisa'}
                        </Button>
                      </>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(team.id)}
                      disabled={processingTeam === team.id}
                    >
                      {processingTeam === team.id ? 'Tar bort...' : 'Ta bort'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 