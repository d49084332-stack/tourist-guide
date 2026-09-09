import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
