import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// role prop optional hai — agar diya to role bhi check karega
export default function ProtectedRoute({ children, role }) {
  const { token, user } = useSelector((s) => s.auth);
  const location = useLocation();

  // Login nahi hai to login page pe bhejo
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check — agar wrong role hai to home pe bhejo
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}