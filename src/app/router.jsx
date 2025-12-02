// src/app/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/auth/Login";

import Dashboard from "../pages/dashboard/Dashboard";
import Avisos from "../pages/avisos/Avisos";
import Reportes from "../pages/reportes/Reportes";
import ReporteDetail from "../pages/reportes/ReporteDetail";

// Alertas
import AdminAlertasPage from "../pages/alertas/AdminAlertasPage";
import AdminAlertaDetalle from "../pages/alertas/AdminAlertaDetalle";

// Finanzas
import CargosMantenimiento from "../pages/finanzas/CargosMantenimiento";
import CargosServicios from "../pages/finanzas/CargosServicios";

// Usuarios
import UsuariosList from "../pages/usuarios/UsuariosList";
import MiPerfil from "../pages/usuarios/MiPerfil";

// Invitados
import InvitadosList from "../pages/invitados/InvitadosList";

// QR personales
import QRPersonalList from "../pages/qr/QrPersonalesList";

// Mapa
import MapaAdmin from "../pages/mapa/MapaAdmin";

// Servicios - catálogo
import ServicesList from "../pages/servicios/ServicesList";

// Personal de mantenimiento
import PersonalMantenimientoList from "../pages/servicios/PersonalMantenimientoList";

// Solicitudes de servicio
import SolicitudesList from "../pages/servicios/SolicitudesList";

// *** Amenidades ***
import AmenidadesList from "../pages/amenidades/AmenidadesList";

// *** Reservas de amenidades ***
import ReservasList from "../pages/reservas/ReservasList";

import NotFound from "../pages/misc/NotFound";
import RoleProtectedRoute from "./RoleProtectedRoute";

export const router = createBrowserRouter([
  { path: "/auth/login", element: <Login /> },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      // Redirección inteligente según rol
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "admin",
        element: <RoleBasedRedirect />,
      },

      // Dashboard - Solo Admin
      {
        path: "admin/dashboard",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <Dashboard />
          </RoleProtectedRoute>
        ),
      },

      // Perfil - Todos
      { path: "admin/perfil", element: <MiPerfil /> },

      // Alertas - Admin y Guardia
      {
        path: "admin/alertas",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin", "Guardia"]}>
            <AdminAlertasPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/alertas/:id",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin", "Guardia"]}>
            <AdminAlertaDetalle />
          </RoleProtectedRoute>
        ),
      },

      // Mapa - Admin y Guardia
      {
        path: "admin/mapa",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin", "Guardia"]}>
            <MapaAdmin />
          </RoleProtectedRoute>
        ),
      },

      // Usuarios - Solo Admin
      {
        path: "admin/usuarios/residentes",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <UsuariosList />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/usuarios/personal",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <PersonalMantenimientoList />
          </RoleProtectedRoute>
        ),
      },

      // Accesos - Solo Admin
      {
        path: "admin/accesos/invitados",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <InvitadosList />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/accesos/qr-personales",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <QRPersonalList />
          </RoleProtectedRoute>
        ),
      },

      // Amenidades - Solo Admin
      {
        path: "admin/amenidades/amenidades",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <AmenidadesList />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/amenidades/reservas",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <ReservasList />
          </RoleProtectedRoute>
        ),
      },

      // Avisos - Solo Admin
      {
        path: "admin/avisos",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <Avisos />
          </RoleProtectedRoute>
        ),
      },

      // Reportes - Solo Admin
      {
        path: "admin/reportes",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <Reportes />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/reportes/:id",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <ReporteDetail />
          </RoleProtectedRoute>
        ),
      },

      // Finanzas - Solo Admin
      {
        path: "admin/finanzas/cargos-mantenimiento",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <CargosMantenimiento />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/finanzas/cargos-servicios",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <CargosServicios />
          </RoleProtectedRoute>
        ),
      },

      // Servicios - Solo Admin
      {
        path: "admin/servicios/catalogo",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <ServicesList />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/servicios/solicitudes",
        element: (
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <SolicitudesList />
          </RoleProtectedRoute>
        ),
      },

      { path: "*", element: <NotFound /> },
    ],
  },

  { path: "*", element: <NotFound /> },
]);

// Componente auxiliar para redirigir según rol
function RoleBasedRedirect() {
  const { user } = useAuth();

  if (user?.tipoUsuario === "Guardia") {
    return <Navigate to="/admin/alertas" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
}

export default router;
