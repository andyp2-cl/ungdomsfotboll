import { TeamRegistrationForm } from '@/components/auth/TeamRegistrationForm';
import { useNavigate } from 'react-router-dom';

export default function TeamRegistrationPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect to main app after successful registration
    navigate('/players');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ungdomsfotboll
          </h1>
          <p className="text-gray-600">
            Skapa ditt lag och kom igång med att hantera dina spelare
          </p>
        </div>
        
        <TeamRegistrationForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
} 