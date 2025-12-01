// src/pages/servicios/ServicesList.jsx
import { useEffect, useMemo, useState } from "react";
import ServiciosAPI from "../../services/servicios.api";
import ServicioForm from "./ServicioForm";

export default function ServicesList() {
  const [servicios, setServicios] = useState([]);
  const [tiposServicio, setTiposServicio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI estado formulario
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // filtros/búsqueda
  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const [tiposRes, catRes] = await Promise.all([
        ServiciosAPI.getTiposServicio(),
        ServiciosAPI.getCatalogoServicios(),
      ]);

      // ⬇️ Aquí el cambio: http ya devuelve el JSON directamente
      setTiposServicio(tiposRes || []);
      setServicios(catRes || []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el catálogo de servicios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const filtrados = useMemo(() => {
    return servicios.filter((s) => {
      const matchTexto =
        !search.trim() ||
        s.nombreEncargado.toLowerCase().includes(search.toLowerCase()) ||
        s.telefono?.includes(search) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.tipoServicioNombre?.toLowerCase().includes(search.toLowerCase());

      const matchTipo = !tipoFiltro || String(s.tipoServicioID) === tipoFiltro;

      return matchTexto && matchTipo;
    });
  }, [servicios, search, tipoFiltro]);

  const abrirNuevo = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const abrirEditar = (servicio) => {
    setEditing(servicio);
    setFormOpen(true);
  };

  const handleSubmitForm = async (payload) => {
    try {
      setError("");

      if (editing) {
        await ServiciosAPI.actualizarServicio(editing.servicioID, payload);
      } else {
        await ServiciosAPI.crearServicio(payload);
      }

      setFormOpen(false);
      setEditing(null);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError("Hubo un error al guardar el servicio.");
    }
  };

  const toggleDisponibilidad = async (servicio) => {
    try {
      await ServiciosAPI.actualizarDisponibilidad(
        servicio.servicioID,
        !servicio.disponible
      );
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar la disponibilidad.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Catálogo de servicios
          </h1>
          <p className="text-sm text-slate-500">
            Personal de mantenimiento registrado (plomería, electricidad, etc.).
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
        >
          <span>+ Nuevo servicio</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Buscar por encargado, tipo, teléfono o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos los tipos</option>
            {tiposServicio.map((t) => (
              <option key={t.tipoServicioID} value={t.tipoServicioID}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">Encargado</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-left">Correo</th>
                <th className="px-4 py-2 text-center">Disponibilidad</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Cargando servicios...
                  </td>
                </tr>
              )}

              {!loading && filtrados.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No hay servicios registrados.
                  </td>
                </tr>
              )}

              {!loading &&
                filtrados.map((s) => (
                  <tr
                    key={s.servicioID}
                    className="border-t border-slate-100 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-2">
                      <div className="font-medium text-slate-800">
                        {s.nombreEncargado}
                      </div>
                      {s.numeroServiciosCompletados > 0 && (
                        <div className="text-xs text-slate-500">
                          {s.numeroServiciosCompletados} servicio(s) completados
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs px-3 py-1">
                        {s.tipoServicioNombre}
                      </span>
                    </td>
                    <td className="px-4 py-2">{s.telefono}</td>
                    <td className="px-4 py-2">{s.email}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => toggleDisponibilidad(s)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          s.disponible
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {s.disponible ? "Disponible" : "No disponible"}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => abrirEditar(s)}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-white hover:bg-slate-900"
                      >
                        Editar
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
      <ServicioForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmitForm}
        tiposServicio={tiposServicio}
        initial={editing}
      />
    </div>
  );
}
