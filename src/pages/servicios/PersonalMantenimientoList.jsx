// src/pages/servicios/PersonalMantenimientoList.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import ServiciosContext from "../../context/Servicios/ServiciosContext";
import PersonalMantenimientoForm from "./PersonalMantenimientoForm";

export default function PersonalMantenimientoList() {
  const {
    personal, // lista desde el context
    loading, // loading global del módulo Servicios
    error, // error global
    cargarPersonalMantenimiento, // acción para cargar
    crearPersonalMantenimiento, // acción para crear
    // por si después agregas actualización en el context:
    actualizarPersonalMantenimiento,
  } = useContext(ServiciosContext);

  const [search, setSearch] = useState("");

  // modal
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Cargar datos desde el context al montar
  useEffect(() => {
    cargarPersonalMantenimiento();
  }, [cargarPersonalMantenimiento]);

  const filtrados = useMemo(() => {
    const txt = search.toLowerCase().trim();
    if (!txt) return personal || [];

    return (personal || []).filter((p) => {
      return (
        p.nombrePersona?.toLowerCase().includes(txt) ||
        p.puesto?.toLowerCase().includes(txt) ||
        p.turno?.toLowerCase().includes(txt) ||
        p.diasLaborales?.toLowerCase().includes(txt)
      );
    });
  }, [personal, search]);

  const abrirNuevo = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const abrirEditar = (persona) => {
    setEditing(persona);
    setFormOpen(true);
  };

  const handleSubmitForm = async (payload) => {
    try {
      if (editing) {
        if (typeof actualizarPersonalMantenimiento === "function") {
          await actualizarPersonalMantenimiento(
            editing.personalMantenimientoID,
            payload
          );
        } else {
          console.warn(
            "Actualizar personal aún no implementado en el contexto; solo se soporta creación."
          );
        }
      } else {
        await crearPersonalMantenimiento(payload);
      }

      setFormOpen(false);
      setEditing(null);
      await cargarPersonalMantenimiento();
    } catch (err) {
      // El context ya maneja el error global, aquí solo registramos
      console.error("Error al guardar personal de mantenimiento:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Personal de mantenimiento
          </h1>
          <p className="text-sm text-slate-500">
            Colaboradores internos (conserjes, jardineros, electricistas, etc.)
            responsables del mantenimiento de la unidad.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
        >
          + Registrar personal
        </button>
      </div>

      {/* Filtro/búsqueda */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
        <input
          type="text"
          placeholder="Buscar por nombre, puesto, turno o días laborales..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Puesto</th>
                <th className="px-4 py-2 text-left">Turno</th>
                <th className="px-4 py-2 text-left">Días laborales</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-center">Estado</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Cargando personal...
                  </td>
                </tr>
              )}

              {!loading && filtrados.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No hay personal registrado.
                  </td>
                </tr>
              )}

              {!loading &&
                filtrados.map((p) => (
                  <tr
                    key={p.personalMantenimientoID}
                    className="border-t border-slate-100 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-2">
                      <div className="font-medium text-slate-800">
                        {p.nombrePersona}
                      </div>
                    </td>
                    <td className="px-4 py-2">{p.puesto}</td>
                    <td className="px-4 py-2">{p.turno}</td>
                    <td className="px-4 py-2">{p.diasLaborales}</td>
                    <td className="px-4 py-2">{p.telefonoPersona}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          p.activo
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => abrirEditar(p)}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-white hover:bg-slate-900"
                      >
                        Ver / editar
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
          {error}
        </div>
      )}

      {/* Modal formulario */}
      <PersonalMantenimientoForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmitForm}
        initial={editing}
        loading={loading}
        apiError={error}
      />
    </div>
  );
}
