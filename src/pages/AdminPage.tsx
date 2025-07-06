import { TeamApprovalList } from '@/components/admin/TeamApprovalList';
import { useTeam } from '@/hooks/useTeam';
import { Navigate } from 'react-router-dom';

export default function AdminPage() {
  const { isAdmin, loading } = useTeam();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Laddar...</p>
        </div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/players" replace />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">
          Hantera lag och användare på Ungdomsfotboll-plattformen
        </p>
      </div>

      <TeamApprovalList />
    </div>
  );
} 