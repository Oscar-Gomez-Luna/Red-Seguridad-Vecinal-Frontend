// src/pages/servicios/ServiciosTabs.jsx
import { NavLink } from "react-router-dom";

export default function ServiciosTabs() {
  const baseCls =
    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors";

  return (
    <aside className="w-56 shrink-0">
      <h3 className="text-[11px] font-semibold tracking-[0.18em] text-emerald-900 mb-3">
        SERVICIOS
      </h3>
      <nav className="space-y-1">
        <NavLink
          to="/admin/servicios/catalogo"
          className={({ isActive }) =>
            `${baseCls} ${
              isActive
                ? "bg-emerald-100 text-emerald-900"
                : "text-emerald-800 hover:bg-emerald-50"
            }`
          }
        >
          <span className="text-lg" aria-hidden>
            💼
          </span>
          <span>Catálogo</span>
        </NavLink>

        <NavLink
          to="/admin/servicios/solicitudes"
          className={({ isActive }) =>
            `${baseCls} ${
              isActive
                ? "bg-emerald-100 text-emerald-900"
                : "text-emerald-800 hover:bg-emerald-50"
            }`
          }
        >
          <span className="text-lg" aria-hidden>
            📄
          </span>
          <span>Solicitudes</span>
        </NavLink>
      </nav>
    </aside>
  );
}
