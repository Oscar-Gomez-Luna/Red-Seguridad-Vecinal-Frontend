// src/pages/servicios/SolicitudesList.jsx
import { useEffect, useMemo, useState } from "react";
import ServiciosAPI from "../../services/servicios.api";
import AsignacionForm from "./AsignacionForm";
import Swal from "sweetalert2";

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
      const errorMsg = "No se pudieron cargar las solicitudes de servicio.";
      setError(errorMsg);

      await Swal.fire({
        title: "Error de carga",
        text: errorMsg,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  // Mostrar error con SweetAlert si existe
  useEffect(() => {
    if (error && !loading) {
      Swal.fire({
        title: "Error",
        text: error,
        icon: "error",
        confirmButtonColor: "#ef4444",
      }).then(() => {
        setError("");
      });
    }
  }, [error, loading]);

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

  const abrirAsignacion = async (solicitud) => {
    // Verificar si la solicitud ya está completada o cancelada
    if (solicitud.estado === "Completada") {
      await Swal.fire({
        title: "Solicitud completada",
        text: "Esta solicitud ya ha sido marcada como completada y no puede ser modificada.",
        icon: "info",
        confirmButtonColor: "#10b981",
      });
      return;
    }

    if (solicitud.estado === "Cancelada") {
      await Swal.fire({
        title: "Solicitud cancelada",
        text: "Esta solicitud ha sido cancelada y no puede ser modificada.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setSeleccionada(solicitud);
    setAsignacionOpen(true);
  };

  const handleUpdated = async (
    message = "Solicitud actualizada exitosamente"
  ) => {
    await Swal.fire({
      title: "¡Éxito!",
      text: message,
      icon: "success",
      confirmButtonColor: "#10b981",
    });

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

  const handleFiltroEstado = async (e) => {
    const value = e.target.value;
    setFiltroEstado(value);

    if (value) {
      // Mostrar confirmación si se filtra por estado "Cancelada"
      if (value === "Cancelada") {
        await Swal.fire({
          title: "Filtro aplicado",
          text: "Mostrando solo solicitudes canceladas",
          icon: "info",
          confirmButtonColor: "#10b981",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    }
  };

  const handleFiltroTipo = async (e) => {
    const value = e.target.value;
    setFiltroTipo(value);

    if (value) {
      await Swal.fire({
        title: "Filtro aplicado",
        text: `Mostrando solo solicitudes de tipo: ${value}`,
        icon: "info",
        confirmButtonColor: "#10b981",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleClearFilters = async () => {
    if (search || filtroEstado || filtroTipo) {
      const result = await Swal.fire({
        title: "¿Limpiar filtros?",
        text: "Se eliminarán todos los filtros aplicados",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, limpiar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        setSearch("");
        setFiltroEstado("");
        setFiltroTipo("");

        await Swal.fire({
          title: "Filtros limpiados",
          icon: "success",
          confirmButtonColor: "#10b981",
          timer: 1000,
          showConfirmButton: false,
        });
      }
    }
  };

  const getFilterSummary = () => {
    const filters = [];
    if (search) filters.push(`Búsqueda: "${search}"`);
    if (filtroEstado) filters.push(`Estado: ${filtroEstado}`);
    if (filtroTipo) filters.push(`Tipo: ${filtroTipo}`);

    return filters.length > 0 ? `(${filters.join(", ")})` : "";
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

        {(search || filtroEstado || filtroTipo) && (
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <span>Limpiar filtros</span>
            <span className="text-xs">✕</span>
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por descripción, residente, tipo o asignado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filtroEstado}
            onChange={handleFiltroEstado}
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
            onChange={handleFiltroTipo}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos los tipos</option>
            <option value="Plomería">Plomería</option>
            <option value="Electricidad">Electricidad</option>
            <option value="Limpieza">Limpieza</option>
            <option value="Jardineria">Jardinería</option>
            <option value="Pintura">Pintura</option>
            <option value="Carpinteria">Carpintería</option>
          </select>
        </div>
      </div>

      {/* Resumen de resultados */}
      <div className="text-sm text-slate-600">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Cargando solicitudes...</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              Mostrando{" "}
              <span className="font-semibold">{filtradas.length}</span> de{" "}
              <span className="font-semibold">{solicitudes.length}</span>{" "}
              solicitudes
              <span className="text-emerald-600 ml-1">
                {getFilterSummary()}
              </span>
            </div>
            {filtradas.length === 0 && solicitudes.length > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Ver todas
              </button>
            )}
          </div>
        )}
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
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      Cargando solicitudes...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filtradas.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    {solicitudes.length === 0 ? (
                      <div className="space-y-2">
                        <div className="text-slate-400">
                          No hay solicitudes registradas
                        </div>
                        <div className="text-xs text-slate-500">
                          Los residentes aún no han creado solicitudes de
                          servicio
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-slate-400">
                          No se encontraron solicitudes con los filtros
                          aplicados
                        </div>
                        <button
                          onClick={handleClearFilters}
                          className="px-3 py-1 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Ver todas las solicitudes
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}

              {!loading &&
                filtradas.map((s) => (
                  <tr
                    key={s.solicitudID}
                    className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-4 py-2 text-slate-500">
                      <div className="font-mono font-medium">
                        #{s.solicitudID}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium text-slate-800">
                        {s.nombreUsuario}
                      </div>
                      {s.numeroCasa && (
                        <div className="text-xs text-slate-500">
                          Casa: {s.numeroCasa}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs">
                        {s.tipoServicioNombre}
                      </span>
                    </td>
                    <td className="px-4 py-2 max-w-xs">
                      <p className="line-clamp-2 text-sm">{s.descripcion}</p>
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <div className="font-medium">
                        {s.fechaPreferida || "-"}
                      </div>
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
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
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
                        disabled={
                          s.estado === "Completada" || s.estado === "Cancelada"
                        }
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          s.estado === "Completada" || s.estado === "Cancelada"
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
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
