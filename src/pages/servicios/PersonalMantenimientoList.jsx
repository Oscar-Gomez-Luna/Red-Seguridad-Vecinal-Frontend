import { useContext, useEffect, useMemo, useState } from "react";
import PersonalContext from "@/context/Personal/PersonalContext";
import PersonalMantenimientoForm from "./PersonalMantenimientoForm";

export default function PersonalMantenimientoList() {
  const {
    personalMantenimiento,
    loading,
    error,
    notification,
    getPersonalMantenimiento,
    crearPersonalMantenimiento,
    clearError,
    clearNotification,
  } = useContext(PersonalContext);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    getPersonalMantenimiento();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => clearNotification(), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filtrados = useMemo(() => {
    return personalMantenimiento.filter((p) => {
      const txt = search.toLowerCase();
      if (!txt.trim()) return true;

      return (
        p.nombrePersona?.toLowerCase().includes(txt) ||
        p.puesto?.toLowerCase().includes(txt) ||
        p.turno?.toLowerCase().includes(txt) ||
        p.diasLaborales?.toLowerCase().includes(txt)
      );
    });
  }, [personalMantenimiento, search]);

  const abrirNuevo = () => {
    setViewing(null);
    setFormOpen(true);
  };

  const abrirDetalle = (persona) => {
    setViewing(persona);
    setFormOpen(true);
  };

  const handleSubmitForm = async (payload) => {
    try {
      await crearPersonalMantenimiento(payload);
      setFormOpen(false);
      setViewing(null);
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  return (
    <div className="px-4 md:px-8 pb-10">
      <header className="pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Personal de Mantenimiento
        </h1>
        <p className="mt-1 text-slate-500 max-w-3xl">
          Colaboradores internos responsables del mantenimiento de la unidad.
        </p>
      </header>

      {notification && (
        <div
          className={`mb-4 p-4 rounded-2xl border ${
            notification.type === "success"
              ? "bg-green-50 border-green-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-lg ${
                notification.type === "success"
                  ? "text-green-600"
                  : "text-blue-600"
              }`}
            >
              {notification.type === "success" ? "✓" : "i"}
            </span>
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  notification.type === "success"
                    ? "text-green-800"
                    : "text-blue-800"
                }`}
              >
                {notification.message}
              </p>
            </div>
            <button
              onClick={clearNotification}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <section className="mb-6">
        <div className="bg-emerald-600 text-white rounded-3xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-xl font-bold">Gestión de Personal</h2>
            <p className="text-emerald-100 text-sm md:text-base">
              Administra el personal de mantenimiento del fraccionamiento.
            </p>
          </div>
          <button
            onClick={getPersonalMantenimiento}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/30 text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <span>⟳</span>
            <span>{loading ? "Actualizando..." : "Actualizar"}</span>
          </button>
        </div>
      </section>

      <section className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre, puesto, turno o días laborales..."
            className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={abrirNuevo}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          + Registrar Personal
        </button>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-emerald-700 text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-3 flex items-center">
          <div className="w-1/6 text-center">Nombre</div>
          <div className="w-1/6 text-center">Puesto</div>
          <div className="w-1/6 text-center">Turno</div>
          <div className="w-1/6 text-center">Días Laborales</div>
          <div className="w-1/6 text-center">Teléfono</div>
          <div className="w-1/12 text-center">Estado</div>
          <div className="flex-1 text-center">Acciones</div>
        </div>

        {loading && personalMantenimiento.length === 0 ? (
          <div className="px-4 md:px-6 py-8 text-sm text-slate-500 text-center">
            Cargando personal...
          </div>
        ) : error ? (
          <div className="px-4 md:px-6 py-6 text-sm text-red-600 text-center">
            {error}
            <button
              onClick={clearError}
              className="ml-2 text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="px-4 md:px-6 py-8 text-sm text-slate-500 text-center">
            No hay personal registrado con los filtros seleccionados.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtrados.map((p) => (
              <li
                key={p.personalMantenimientoID}
                className="px-4 md:px-6 py-4 text-xs md:text-sm hover:bg-emerald-50/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-1/6 text-center">
                    <div className="font-medium text-slate-800">
                      {p.nombrePersona}
                    </div>
                  </div>
                  <div className="w-1/6 text-center text-slate-700">
                    {p.puesto}
                  </div>
                  <div className="w-1/6 text-center text-slate-700">
                    {p.turno}
                  </div>
                  <div className="w-1/6 text-center text-slate-700">
                    {p.diasLaborales}
                  </div>
                  <div className="w-1/6 text-center text-slate-700">
                    {p.telefonoPersona}
                  </div>
                  <div className="w-1/12 flex justify-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        p.activo
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-slate-200 text-slate-700 border border-slate-300"
                      }`}
                    >
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <button
                      onClick={() => abrirDetalle(p)}
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-600 text-white text-[11px] font-semibold hover:bg-slate-700 transition-colors"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PersonalMantenimientoForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setViewing(null);
        }}
        onSubmit={handleSubmitForm}
        initial={viewing}
        mode={viewing ? "view" : "create"}
      />
    </div>
  );
}
