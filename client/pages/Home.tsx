import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const navigatedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !navigatedRef.current) {
      navigatedRef.current = true;
      navigate(user ? '/dashboard' : '/login', { replace: true });
    }
  }, [isLoading, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}
