// src/sidebar/SidebarItem.jsx
import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, icon: Icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-xl px-3 py-2 transition",
          isActive
            ? "bg-emerald-600 text-white shadow"
            : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700",
        ].join(" ")
      }
    >
      {Icon && <Icon size={18} />}
      <span className="font-medium">{children}</span>
    </NavLink>
  );
}
