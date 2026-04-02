import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <div className="p-10 text-center">Maaf, kamu tidak punya akses ke fitur ini.</div>;
  }

  return children;
};