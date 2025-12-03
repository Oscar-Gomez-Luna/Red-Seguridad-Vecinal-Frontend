import { useContext, useEffect, useMemo, useState } from "react";
import PersonalContext from "@/context/Personal/PersonalContext";
import PersonalMantenimientoForm from "./PersonalMantenimientoForm";
import Swal from "sweetalert2";

export default function PersonalMantenimientoList() {
  const {
    personalMantenimiento,
    loading,
    error,
    notification,
    getPersonalMantenimiento,
    crearPersonalMantenimiento,
    actualizarPersonalMantenimientoCompleto,
    clearError,
    clearNotification,
  } = useContext(PersonalContext);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [mode, setMode] = useState("create");

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
    setMode("create");
    setFormOpen(true);
  };

  const abrirDetalle = (persona) => {
    setViewing(persona);
    setMode("view");
    setFormOpen(true);
  };

  const handleSubmitForm = async (payload) => {
    try {
      await crearPersonalMantenimiento(payload);
      await Swal.fire({
        icon: "success",
        title: "¡Personal registrado!",
        text: "El personal de mantenimiento ha sido registrado correctamente",
        confirmButtonColor: "#10B981",
        confirmButtonText: "Entendido",
      });
      setFormOpen(false);
      setViewing(null);
    } catch (err) {
      console.error("Error al guardar:", err);
      await Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text:
          err.message || "No se pudo registrar el personal de mantenimiento",
        confirmButtonColor: "#EF4444",
        confirmButtonText: "Entendido",
      });
    }
  };

  const handleUpdateForm = async (id, payload) => {
    try {
      await actualizarPersonalMantenimientoCompleto(id, payload);
      await Swal.fire({
        icon: "success",
        title: "¡Personal actualizado!",
        text: "Los datos del personal han sido actualizados correctamente",
        confirmButtonColor: "#10B981",
        confirmButtonText: "Entendido",
      });
      setFormOpen(false);
      setViewing(null);
      setMode("create");
    } catch (err) {
      console.error("Error al actualizar:", err);
      await Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text:
          err.message || "No se pudo actualizar el personal de mantenimiento",
        confirmButtonColor: "#EF4444",
        confirmButtonText: "Entendido",
      });
    }
  };

  return (
    <div className="px-4 md:px-8 pb-10">
      <header className="pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827]">
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
              ? "bg-emerald-50 border-emerald-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-lg ${
                notification.type === "success"
                  ? "text-emerald-600"
                  : "text-blue-600"
              }`}
            >
              {notification.type === "success" ? "✓" : "i"}
            </span>
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  notification.type === "success"
                    ? "text-emerald-800"
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
        <div className="bg-[#047857] text-white rounded-3xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-xl font-bold">Gestión de Personal</h2>
            <p className="opacity-90 text-sm md:text-base">
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
            className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={abrirNuevo}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#10B981] text-white text-sm font-semibold hover:bg-[#059669] transition-colors"
        >
          + Registrar Personal
        </button>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-[#047857] text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-3 flex items-center">
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
            <div className="animate-spin h-6 w-6 border-2 border-[#F97316] border-t-transparent rounded-full mx-auto" />
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
                className="px-4 md:px-6 py-4 text-xs md:text-sm hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-1/6 text-center">
                    <div className="font-medium text-[#111827]">
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
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#F97316] text-white text-[11px] font-semibold hover:bg-[#ea580c] transition-colors"
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
          setMode("create");
        }}
        onSubmit={handleSubmitForm}
        onUpdate={handleUpdateForm}
        initial={viewing}
        mode={mode}
        onModificar={() => setMode("edit")}
      />
    </div>
  );
}
