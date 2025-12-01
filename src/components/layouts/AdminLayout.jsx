import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const usuario = { nombre: "Administrador", online: true };

export default function AdminLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const logout = () => {
    localStorage.removeItem("auth_token");
    navigate("/", { replace: true });
  };

  const linkCls = ({ isActive }) =>
    [
      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
      "text-ink/90 hover:bg-emerald-50 hover:text-ink",
      isActive ? "bg-emerald-100 font-semibold text-ink" : "",
      collapsed ? "justify-center" : "",
    ].join(" ");

  // Iconos SVG sin librerías (puedes cambiarlos luego por heroicons/lucide)
  const Icon = {
    menu: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="currentColor" d="M3 6h18v2H3m0 5h18v2H3m0 5h18v2H3" />
      </svg>
    ),
    home: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="currentColor" d="M12 3 2 12h2v8h6v-5h4v5h6v-8h2z" />
      </svg>
    ),
    warn: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z"
        />
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5l-2 2v1h16v-1Z"
        />
      </svg>
    ),
    map: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M15 19l-6 3l-6-3V5l6 3l6-3l6 3v14l-6-3ZM9 8v11l6-3V5L9 8Z"
        />
      </svg>
    ),
    qr: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M3 3h8v8H3V3m2 2v4h4V5H5m6-2h8v8h-8V3m2 2v4h4V5h-4M3 13h8v8H3v-8m2 2v4h4v-4H5m10 0h-2v2h2v2h2v-2h2v-2h-2v-2h-2v2Z"
        />
      </svg>
    ),
    people: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3s1.34 3 3 3ZM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5S5 6.34 5 8s1.34 3 3 3Zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-1.87 1.28-3.43 3.11-4.15C12.16 12.31 10.15 13 8 13Zm8 0c-.29 0-.57.02-.84.05A5 5 0 0 1 20 18v2h4v-2c0-2.66-5.33-5-8-5Z"
        />
      </svg>
    ),
    building: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M3 21V3h11v18H3Zm2-2h7V5H5v14Zm14 2V8h-3V6h5v15h-2Z"
        />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M7 2v2H5a2 2 0 0 0-2 2v2h18V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm14 8H3v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10Z"
        />
      </svg>
    ),
    toolbox: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M16 7V5a2 2 0 0 0-2-2H10A2 2 0 0 0 8 5v2H4v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7h-4ZM10 5h4v2h-4V5Zm10 6H4v-2h16v2Zm-6 3h-4v-2h4v2Z"
        />
      </svg>
    ),
    file: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 2l4 4h-4V4Z"
        />
      </svg>
    ),
    card: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M20 4H4a2 2 0 0 0-2 2v2h20V6a2 2 0 0 0-2-2Zm2 6H2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8Zm-6 6H6v-2h10v2Z"
        />
      </svg>
    ),
    receipt: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M5 2h14v20l-3-2l-2 2l-2-2l-2 2l-2-2l-3 2V2Zm3 6h8V6H8v2Zm0 4h8v-2H8v2Zm0 4h8v-2H8v2Z"
        />
      </svg>
    ),
    money: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M3 6h18v12H3V6Zm2 2v8h14V8H5Zm7 7a3 3 0 1 1 0-6a3 3 0 0 1 0 6Z"
        />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5Zm-9 9v-1c0-3.31 4.03-6 9-6s9 2.69 9 6v1Z"
        />
      </svg>
    ),
    power: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="currentColor"
          d="M13 3h-2v10h2V3Zm4.83 2.17l-1.41 1.41A7 7 0 1 1 7.58 6.58L6.17 5.17a9 9 0 1 0 11.66 0Z"
        />
      </svg>
    ),
  };

  return (
    <div className="min-h-screen bg-bg grid grid-cols-[auto_1fr]">
      {/* SIDEBAR */}
      <aside
        className={[
          "bg-white shadow-card h-screen sticky top-0 flex flex-col",
          collapsed ? "w-[84px]" : "w-[260px]",
          "transition-[width] duration-200",
        ].join(" ")}
      >
        {/* Header verde */}
        <header className="relative">
          <div
            className="h-24 px-4 flex items-center justify-between text-white
                  bg-gradient-to-br from-[#047857] to-[#10B981] border-b border-white/20"
          >
            {/* Logo + usuario */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="shrink-0 w-12 h-12 rounded-full border-4 border-emerald-200
                      bg-white grid place-items-center overflow-hidden"
              >
                <img
                  src="/logo/imagen_2025-10-26_192500425-removebg-preview-removebg-preview.png"
                  alt="Red de Seguridad Vecinal"
                  className="w-10 h-10 object-contain p-1"
                />
              </div>

              {!collapsed && (
                <div className="leading-tight truncate">
                  <div className="font-extrabold text-lg truncate">
                    {usuario.nombre}
                  </div>

                  {/* Estado */}
                  <div className="flex items-center gap-2 text-white/90 text-xs">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        usuario.online
                          ? "bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,.9)]"
                          : "bg-slate-300"
                      }`}
                      aria-label={usuario.online ? "En línea" : "Desconectado"}
                      title={usuario.online ? "En línea" : "Desconectado"}
                    />
                    <span>{usuario.online ? "Online" : "Offline"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Botón colapsar */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="p-2 rounded-lg hover:bg-white/10"
              title={collapsed ? "Expandir" : "Colapsar"}
            >
              {Icon.menu}
            </button>
          </div>

          <div className="h-[6px] bg-emerald-200/70" />
        </header>

        {/* NAV */}
        <nav className="p-4 space-y-5 flex-1 overflow-y-auto">
          {/* Inicio */}
          <div>
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Inicio
              </p>
            )}
            <NavLink to="/admin" end className={linkCls} title="Dashboard">
              <span className="text-emerald-700">{Icon.home}</span>
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </div>

          {/* Seguridad comunitaria */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Seguridad comunitaria
              </p>
            )}
            <NavLink to="/admin/reportes" className={linkCls} title="Reportes">
              <span className="text-emerald-700">{Icon.warn}</span>
              {!collapsed && <span>Reportes</span>}
            </NavLink>
            <NavLink
              to="/admin/alertas"
              className={linkCls}
              title="Alertas de pánico"
            >
              <span className="text-emerald-700">{Icon.bell}</span>
              {!collapsed && <span>Alertas de pánico</span>}
            </NavLink>
            <NavLink to="/admin/avisos" className={linkCls} title="Avisos">
              <span className="text-emerald-700">{Icon.file}</span>
              {!collapsed && <span>Avisos</span>}
            </NavLink>
            <NavLink to="/admin/mapa" className={linkCls} title="Mapa">
              <span className="text-emerald-700">{Icon.map}</span>
              {!collapsed && <span>Mapa</span>}
            </NavLink>
          </div>

          {/* Accesos */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Accesos
              </p>
            )}
            <NavLink
              to="/admin/accesos/qr-personales"
              className={linkCls}
              title="QR personales"
            >
              <span className="text-emerald-700">{Icon.qr}</span>
              {!collapsed && <span>QR personales</span>}
            </NavLink>
            <NavLink
              to="/admin/accesos/invitados"
              className={linkCls}
              title="Invitados"
            >
              <span className="text-emerald-700">{Icon.people}</span>
              {!collapsed && <span>Invitados</span>}
            </NavLink>
          </div>

          {/* Amenidades / Reservas */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amenidades
              </p>
            )}
            <NavLink
              to="/admin/amenidades"
              className={linkCls}
              title="Amenidades"
            >
              <span className="text-emerald-700">{Icon.building}</span>
              {!collapsed && <span>Amenidades</span>}
            </NavLink>
            <NavLink to="/admin/reservas" className={linkCls} title="Reservas">
              <span className="text-emerald-700">{Icon.calendar}</span>
              {!collapsed && <span>Reservas</span>}
            </NavLink>
          </div>

          {/* Servicios */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Servicios
              </p>
            )}
            <NavLink
              to="/admin/servicios/catalogo"
              className={linkCls}
              title="Catálogo de servicios"
            >
              <span className="text-emerald-700">{Icon.toolbox}</span>
              {!collapsed && <span>Catálogo</span>}
            </NavLink>
            <NavLink
              to="/admin/servicios/solicitudes"
              className={linkCls}
              title="Solicitudes de servicio"
            >
              <span className="text-emerald-700">{Icon.file}</span>
              {!collapsed && <span>Solicitudes</span>}
            </NavLink>
          </div>

          {/* Finanzas */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Finanzas
              </p>
            )}
            <NavLink
              to="/admin/finanzas/cuentas"
              className={linkCls}
              title="Cuentas de usuario"
            >
              <span className="text-emerald-700">{Icon.card}</span>
              {!collapsed && <span>Cuentas de usuario</span>}
            </NavLink>
            <NavLink
              to="/admin/finanzas/cargos-mantenimiento"
              className={linkCls}
              title="Cargos mantenimiento"
            >
              <span className="text-emerald-700">{Icon.receipt}</span>
              {!collapsed && <span>Cargos mantenimiento</span>}
            </NavLink>
            <NavLink
              to="/admin/finanzas/cargos-servicios"
              className={linkCls}
              title="Cargos servicios"
            >
              <span className="text-emerald-700">{Icon.file}</span>
              {!collapsed && <span>Cargos servicios</span>}
            </NavLink>
            <NavLink
              to="/admin/finanzas/pagos"
              className={linkCls}
              title="Pagos"
            >
              <span className="text-emerald-700">{Icon.money}</span>
              {!collapsed && <span>Pagos</span>}
            </NavLink>
          </div>

          {/* Usuarios */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Usuarios
              </p>
            )}
            <NavLink
              to="/admin/usuarios/residentes"
              className={linkCls}
              title="Residentes"
            >
              <span className="text-emerald-700">{Icon.user}</span>
              {!collapsed && <span>Residentes</span>}
            </NavLink>
            <NavLink
              to="/admin/usuarios/personal"
              className={linkCls}
              title="Personal mantenimiento"
            >
              <span className="text-emerald-700">{Icon.toolbox}</span>
              {!collapsed && <span>Personal mantenimiento</span>}
            </NavLink>
          </div>

          {/* Configuración / Catálogos */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Configuración
              </p>
            )}
            <NavLink
              to="/admin/config/catalogos"
              className={linkCls}
              title="Catálogos & SLA"
            >
              <span className="text-emerald-700">{Icon.file}</span>
              {!collapsed && <span>Catálogos & SLA</span>}
            </NavLink>
            <NavLink to="/admin/perfil" className={linkCls} title="Perfil">
              <span className="text-emerald-700">{Icon.user}</span>
              {!collapsed && <span>Perfil</span>}
            </NavLink>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className={[
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
              "bg-red-50 text-red-600 hover:bg-red-100",
              collapsed ? "justify-center" : "",
            ].join(" ")}
            title="Cerrar sesión"
          >
            {Icon.power}
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </nav>
      </aside>

      {/* CONTENIDO */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
