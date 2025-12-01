// src/pages/servicios/SolicitudesList.jsx
import { useEffect, useMemo, useState } from "react";
import ServiciosAPI from "../../services/servicios.api";
import AsignacionForm from "./AsignacionForm";

export default function SolicitudesList() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  const [asignacionOpen, setAsignacionOpen] = useState(false);
  const [seleccionada, setSeleccionada] = useState(null);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ServiciosAPI.getSolicitudesServicios();
      setSolicitudes(res || []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las solicitudes de servicio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const filtradas = useMemo(() => {
    return solicitudes.filter((s) => {
      const txt = search.toLowerCase();

      const matchTexto =
        !txt.trim() ||
        s.descripcion?.toLowerCase().includes(txt) ||
        s.nombreUsuario?.toLowerCase().includes(txt) ||
        s.tipoServicioNombre?.toLowerCase().includes(txt) ||
        s.nombreAsignado?.toLowerCase().includes(txt);

      const matchEstado =
        !filtroEstado || s.estado?.toLowerCase() === filtroEstado.toLowerCase();

      const matchTipo =
        !filtroTipo ||
        String(s.tipoServicioID) === String(filtroTipo) ||
        s.tipoServicioNombre?.toLowerCase() === filtroTipo.toLowerCase();

      return matchTexto && matchEstado && matchTipo;
    });
  }, [solicitudes, search, filtroEstado, filtroTipo]);

  const abrirAsignacion = (s) => {
    setSeleccionada(s);
    setAsignacionOpen(true);
  };

  const handleUpdated = async () => {
    await cargarSolicitudes();
    setAsignacionOpen(false);
    setSeleccionada(null);
  };

  const estadoColor = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-amber-100 text-amber-700";
      case "En proceso":
        return "bg-sky-100 text-sky-700";
      case "Completada":
        return "bg-emerald-100 text-emerald-700";
      case "Cancelada":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const urgenciaColor = (u) => {
    switch (u) {
      case "Alta":
        return "bg-red-100 text-red-700";
      case "Media":
        return "bg-amber-100 text-amber-700";
      case "Baja":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Solicitudes de servicio
          </h1>
          <p className="text-sm text-slate-500">
            Solicitudes generadas por los residentes para el personal de
            mantenimiento (plomería, electricidad, limpieza, etc.).
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por descripción, residente, tipo o asignado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos los tipos</option>
            {/* Si quieres filtros por ID exacto, puedes dejar solo texto libre */}
            <option value="Plomería">Plomería</option>
            <option value="Electricidad">Electricidad</option>
            <option value="Limpieza">Limpieza</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">Folio</th>
                <th className="px-4 py-2 text-left">Residente</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Fecha/Hora pref.</th>
                <th className="px-4 py-2 text-center">Urgencia</th>
                <th className="px-4 py-2 text-left">Asignado a</th>
                <th className="px-4 py-2 text-center">Estado</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Cargando solicitudes...
                  </td>
                </tr>
              )}

              {!loading && filtradas.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No hay solicitudes registradas.
                  </td>
                </tr>
              )}

              {!loading &&
                filtradas.map((s) => (
                  <tr
                    key={s.solicitudID}
                    className="border-t border-slate-100 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-2 text-slate-500">
                      #{s.solicitudID}
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium text-slate-800">
                        {s.nombreUsuario}
                      </div>
                    </td>
                    <td className="px-4 py-2">{s.tipoServicioNombre}</td>
                    <td className="px-4 py-2 max-w-xs">
                      <p className="line-clamp-2">{s.descripcion}</p>
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <div>{s.fechaPreferida || "-"}</div>
                      <div className="text-slate-500">
                        {s.horaPreferida?.slice(0, 5) || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${urgenciaColor(
                          s.urgencia
                        )}`}
                      >
                        {s.urgencia}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {s.nombreAsignado ? (
                        <div>
                          <div className="font-medium text-slate-800">
                            {s.nombreAsignado}
                          </div>
                          {s.telefonoAsignado && (
                            <div className="text-xs text-slate-500">
                              {s.telefonoAsignado}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${estadoColor(
                          s.estado
                        )}`}
                      >
                        {s.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => abrirAsignacion(s)}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-white hover:bg-slate-900"
                      >
                        Gestionar
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

      {/* Modal de asignación */}
      <AsignacionForm
        open={asignacionOpen}
        onClose={() => {
          setAsignacionOpen(false);
          setSeleccionada(null);
        }}
        solicitud={seleccionada}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
