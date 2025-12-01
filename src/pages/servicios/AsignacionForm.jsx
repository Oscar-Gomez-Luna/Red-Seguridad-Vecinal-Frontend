// src/pages/servicios/AsignacionForm.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import ServiciosContext from "../../context/Servicios/ServiciosContext";

export default function AsignacionForm({
  open,
  onClose,
  solicitud,
  onUpdated,
}) {
  const {
    catalogo,
    cargarCatalogoServicios,
    asignarSolicitud,
    actualizarEstadoSolicitud,
    completarSolicitud,
    loading,
    error: errorServicios,
  } = useContext(ServiciosContext);

  // Buscador / selección de servicio del catálogo
  const [searchServicio, setSearchServicio] = useState("");
  const [servicioAsignado, setServicioAsignado] = useState("");

  const [estado, setEstado] = useState("Pendiente");
  const [notasAdmin, setNotasAdmin] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  const [showResultados, setShowResultados] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

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

  // Cargar catálogo de servicios cuando se abre el modal
  useEffect(() => {
    if (!open) return;
    cargarCatalogoServicios();
  }, [open, cargarCatalogoServicios]);

  // Cargar datos de la solicitud cuando cambia
  useEffect(() => {
    if (!open || !solicitud) return;

    setEstado(solicitud.estado || "Pendiente");
    setNotasAdmin(solicitud.notasAdmin || "");
    setServicioAsignado(solicitud.personaAsignado || ""); // el backend sigue
    // usando personaAsignado como ID del servicio asignado
  }, [open, solicitud]);

  // Servicios del catálogo que están disponibles (y activos)
  const serviciosDisponibles = useMemo(() => {
    return (catalogo || []).filter(
      (s) => s.disponible === true && s.activo !== false
    );
  }, [catalogo]);

  // Mostrar el texto del servicio seleccionado una vez cargado el catálogo
  useEffect(() => {
    if (!open || !solicitud || !servicioAsignado) return;

    const seleccionado = serviciosDisponibles.find(
      (s) => Number(s.servicioID) === Number(servicioAsignado)
    );

    if (seleccionado) {
      setSearchServicio(
        `${seleccionado.nombreEncargado} — ${seleccionado.tipoServicioNombre}`
      );
    }
  }, [open, solicitud, servicioAsignado, serviciosDisponibles]);

  // Filtro por nombre del encargado o tipo de servicio
  const serviciosFiltrados = useMemo(() => {
    const q = searchServicio.trim().toLowerCase();
    if (!q) return serviciosDisponibles;

    return serviciosDisponibles.filter((s) => {
      const nombre = s.nombreEncargado || "";
      const tipo = s.tipoServicioNombre || "";
      return nombre.toLowerCase().includes(q) || tipo.toLowerCase().includes(q);
    });
  }, [serviciosDisponibles, searchServicio]);

  const handleSelectServicio = (s) => {
    setServicioAsignado(s.servicioID);
    setSearchServicio(`${s.nombreEncargado} — ${s.tipoServicioNombre}`);
    setShowResultados(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showResultados || serviciosFiltrados.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < serviciosFiltrados.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : serviciosFiltrados.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const index = highlightIndex >= 0 ? highlightIndex : 0;
      const seleccionado = serviciosFiltrados[index];
      if (seleccionado) {
        handleSelectServicio(seleccionado);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal("");
    setSaving(true);

    try {
      const ops = [];

      // Asignar servicio si cambió
      if (
        servicioAsignado &&
        Number(servicioAsignado) !== Number(solicitud.personaAsignado)
      ) {
        ops.push(
          asignarSolicitud(solicitud.solicitudID, Number(servicioAsignado))
        );
      }

      // Actualizar estado si cambió
      if (estado && estado !== solicitud.estado) {
        ops.push(actualizarEstadoSolicitud(solicitud.solicitudID, estado));
      }

      // Completar con notas si el estado es Completada
      if (estado === "Completada") {
        ops.push(
          completarSolicitud(solicitud.solicitudID, {
            notasAdmin: notasAdmin?.trim() || "",
          })
        );
      }

      if (ops.length > 0) {
        await Promise.all(ops);
      }

      if (onUpdated) await onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorLocal("Hubo un error al guardar los cambios de la solicitud.");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !solicitud) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden">
        {/* Barra superior verde */}
        <div className="bg-emerald-700 text-white px-5 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              Gestionar solicitud #{solicitud.solicitudID}
            </h2>
            <p className="text-xs opacity-90">
              {solicitud.nombreUsuario} — {solicitud.tipoServicioNombre}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${urgenciaColor(
                solicitud.urgencia
              )} bg-opacity-90`}
            >
              Urgencia: {solicitud.urgencia}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900 text-white">
              Estado actual: {solicitud.estado}
            </span>
            <button
              onClick={onClose}
              className="ml-2 text-white/80 hover:text-white text-lg leading-none"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Detalles generales */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm">
            <p className="text-xs font-semibold text-emerald-800 mb-1">
              Detalles generales de la solicitud
            </p>
            <p className="font-semibold text-emerald-900">
              Descripción general:{" "}
              <span className="font-bold">{solicitud.descripcion}</span>
            </p>
            <p className="text-xs text-emerald-800 mt-1">
              Fecha preferida:{" "}
              <span className="font-semibold">
                {solicitud.fechaPreferida || "-"}
              </span>{" "}
              · Hora preferida:{" "}
              <span className="font-semibold">
                {solicitud.horaPreferida?.slice(0, 5) || "-"}
              </span>
            </p>
          </div>

          {/* Asignación y estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Servicio asignado (desde catálogo) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Servicio asignado
              </label>
              <input
                type="text"
                value={searchServicio}
                onChange={(e) => {
                  setSearchServicio(e.target.value);
                  setShowResultados(true);
                  setServicioAsignado("");
                  setHighlightIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Buscar por nombre o tipo de servicio..."
                className="w-full rounded-lg border border-emerald-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {loading && (
                <p className="text-xs text-slate-400 mt-1">
                  Cargando catálogo de servicios...
                </p>
              )}
              {errorServicios && (
                <p className="text-xs text-red-500 mt-1">{errorServicios}</p>
              )}

              {showResultados && searchServicio.trim() && (
                <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm text-sm">
                  {serviciosFiltrados.length === 0 && !servicioAsignado && (
                    <div className="px-3 py-2 text-slate-400">
                      No se encontró servicio disponible.
                    </div>
                  )}

                  {serviciosFiltrados.map((s, index) => (
                    <button
                      key={s.servicioID}
                      type="button"
                      onClick={() => handleSelectServicio(s)}
                      className={`w-full text-left px-3 py-2 ${
                        index === highlightIndex
                          ? "bg-emerald-50"
                          : "hover:bg-emerald-50"
                      }`}
                    >
                      <div className="font-medium text-slate-800">
                        {s.nombreEncargado}
                      </div>
                      <div className="text-xs text-emerald-700 font-semibold">
                        {s.tipoServicioNombre}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {servicioAsignado && searchServicio && (
                <p className="text-xs text-emerald-700 mt-1">
                  Servicio seleccionado: {searchServicio}
                </p>
              )}
            </div>

            {/* Estado de la solicitud */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estado de la solicitud
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En proceso">En proceso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Si marcas como <strong>Completada</strong> puedes agregar notas
                internas.
              </p>
            </div>
          </div>

          {/* Notas internas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notas internas del administrador
            </label>
            <textarea
              rows={3}
              value={notasAdmin}
              onChange={(e) => setNotasAdmin(e.target.value)}
              placeholder="Comentarios, seguimiento o detalles adicionales del servicio..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {(errorLocal || errorServicios) && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {errorLocal || errorServicios}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
