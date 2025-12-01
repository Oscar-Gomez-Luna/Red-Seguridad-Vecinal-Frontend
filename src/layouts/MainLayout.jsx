import { Outlet, Link, useNavigate } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("session") || "null");

  const logout = () => {
    localStorage.removeItem("session");
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] bg-gray-50">
      <header className="h-14 bg-emerald-600 text-white flex items-center justify-between px-4">
        <div className="font-bold">Seguridad Vecinal</div>
        <nav className="flex items-center gap-4">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/avisos">Avisos</Link>
          <Link to="/reportes">Reportes</Link>
          <span className="text-white/80">
            | {session?.nombre || "Usuario"}
          </span>
          <button
            onClick={logout}
            className="bg-white text-emerald-700 px-3 py-1 rounded"
          >
            Salir
          </button>
        </nav>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
