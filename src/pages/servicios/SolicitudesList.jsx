// src/pages/servicios/SolicitudesList.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import ServiciosContext from "../../context/Servicios/ServiciosContext";
import AsignacionForm from "./AsignacionForm";
import EstadoSolicitudPill from "./EstadoSolicitudPill";

export default function SolicitudesList() {
  const {
    solicitudes,
    personal,
    loading,
    error,
    cargarSolicitudes,
    cargarPersonalMantenimiento,
    asignarSolicitud,
    actualizarEstadoSolicitud,
    completarSolicitud,
  } = useContext(ServiciosContext);

  const [busqueda, setBusqueda] = useState("");
  const [openAsignacion, setOpenAsignacion] = useState(false);
  const [solicitudSel, setSolicitudSel] = useState(null);

  useEffect(() => {
    cargarSolicitudes();
    cargarPersonalMantenimiento();
  }, [cargarSolicitudes, cargarPersonalMantenimiento]);

  const rowsFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return solicitudes || [];
    return (solicitudes || []).filter((s) => {
      const usuario = (s.nombreUsuario || "").toLowerCase();
      const tipo = (s.tipoServicioNombre || "").toLowerCase();
      const desc = (s.descripcion || "").toLowerCase();
      const estado = (s.estado || "").toLowerCase();
      const asignado = (s.nombreAsignado || "").toLowerCase();
      return (
        usuario.includes(q) ||
        tipo.includes(q) ||
        desc.includes(q) ||
        estado.includes(q) ||
        asignado.includes(q)
      );
    });
  }, [busqueda, solicitudes]);

  const handleAbrirAsignar = (row) => {
    setSolicitudSel(row);
    setOpenAsignacion(true);
  };

  const handleAsignar = async (solicitudID, personaAsignado) => {
    await asignarSolicitud(solicitudID, personaAsignado);
    setOpenAsignacion(false);
    setSolicitudSel(null);
  };

  const handleMarcarCompletado = async (row) => {
    if (row.estado && row.estado.toLowerCase() === "completado") return;

    const ok = window.confirm("¿Marcar esta solicitud como completada?");
    if (!ok) return;

    await completarSolicitud(row.solicitudID, {
      notasAdmin: row.notasAdmin || "",
    });
  };

  const handleCambiarEstado = async (row, nuevo) => {
    if (row.estado === nuevo) return;
    await actualizarEstadoSolicitud(row.solicitudID, nuevo);
  };

  return (
    <div className="px-6 py-6">
      {/* Encabezado principal */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Solicitudes de servicio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisa y controla el estado de las solicitudes hechas por los
            residentes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Buscador */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm border border-slate-200">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por usuario, tipo, estado o asignado"
              className="text-sm outline-none border-none bg-transparent placeholder:text-slate-400 w-72"
            />
            <span className="text-slate-400 text-lg" aria-hidden>
              🔍
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl bg-red-50 border border-red-100 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr className="bg-emerald-700 text-white text-left">
                <th className="px-5 py-3 font-semibold whitespace-nowrap">
                  Usuario
                </th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap">
                  Tipo de servicio
                </th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap">
                  Urgencia
                </th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap">
                  Estado
                </th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap">
                  Asignado a
                </th>
                <th className="px-5 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Cargando solicitudes...
                  </td>
                </tr>
              )}

              {!loading && rowsFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No se encontraron solicitudes.
                  </td>
                </tr>
              )}

              {!loading &&
                rowsFiltradas.map((row, idx) => (
                  <tr
                    key={row.solicitudID}
                    className={
                      idx % 2 === 0
                        ? "bg-white"
                        : "bg-emerald-50/40 hover:bg-emerald-50"
                    }
                  >
                    <td className="px-5 py-3 whitespace-nowrap font-semibold text-emerald-900">
                      {row.nombreUsuario}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {row.tipoServicioNombre}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700">
                        {row.urgencia}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <EstadoSolicitudPill estado={row.estado} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {row.nombreAsignado || "Sin asignar"}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleAbrirAsignar(row)}
                          className="rounded-full bg-emerald-600 text-white text-sm font-semibold px-4 py-2 hover:bg-emerald-700"
                        >
                          Detalles
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCambiarEstado(row, "En proceso")}
                          className="rounded-full bg-sky-100 text-sky-800 text-sm font-semibold px-4 py-2 hover:bg-sky-200"
                        >
                          En proceso
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarcarCompletado(row)}
                          disabled={
                            row.estado &&
                            row.estado.toLowerCase() === "completado"
                          }
                          className="rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold px-4 py-2 hover:bg-emerald-200 disabled:opacity-60 disabled:cursor-default"
                        >
                          Completar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de asignación / detalles */}
      <AsignacionForm
        open={openAsignacion}
        onClose={() => {
          setOpenAsignacion(false);
          setSolicitudSel(null);
        }}
        solicitud={solicitudSel}
        personal={personal}
        onSubmit={handleAsignar}
      />
    </div>
  );
}
