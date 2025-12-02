// src/app/RoleProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(user.tipoUsuario)) {
    // Redirigir según el tipo de usuario
    if (user.tipoUsuario === "Guardia") {
      return <Navigate to="/admin/alertas" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
