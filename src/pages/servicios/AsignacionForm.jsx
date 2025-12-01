// src/pages/servicios/AsignacionForm.jsx
import { useEffect, useState } from "react";
import ServiciosAPI from "../../services/servicios.api";

export default function AsignacionForm({
  open,
  onClose,
  solicitud,
  onUpdated,
}) {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [personaAsignado, setPersonaAsignado] = useState("");
  const [estado, setEstado] = useState("");
  const [notasAdmin, setNotasAdmin] = useState("");

  useEffect(() => {
    if (!open || !solicitud) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await ServiciosAPI.getPersonalMantenimiento();
        setPersonal(res || []);

        setPersonaAsignado(solicitud.personaAsignado || "");
        setEstado(solicitud.estado || "Pendiente");
        setNotasAdmin(solicitud.notasAdmin || "");
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el personal de mantenimiento.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, solicitud]);

  if (!open || !solicitud) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const promises = [];

      // Asignar personal si cambió
      if (
        personaAsignado &&
        Number(personaAsignado) !== Number(solicitud.personaAsignado)
      ) {
        promises.push(
          ServiciosAPI.asignarSolicitudServicio(
            solicitud.solicitudID,
            Number(personaAsignado)
          )
        );
      }

      // Actualizar estado si cambió
      if (estado && estado !== solicitud.estado) {
        promises.push(
          ServiciosAPI.actualizarEstadoSolicitud(solicitud.solicitudID, estado)
        );
      }

      // Si está completada y hay notas, llamar endpoint de completar
      if (estado === "Completada") {
        promises.push(
          ServiciosAPI.completarSolicitudServicio(
            solicitud.solicitudID,
            notasAdmin?.trim() || null
          )
        );
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      if (onUpdated) await onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Hubo un error al guardar los cambios de la solicitud.");
    } finally {
      setSaving(false);
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <h2 className="font-semibold text-slate-800">
              Gestionar solicitud #{solicitud.solicitudID}
            </h2>
            <p className="text-xs text-slate-500">
              {solicitud.nombreUsuario} — {solicitud.tipoServicioNombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Resumen */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="font-medium text-slate-800">
                  {solicitud.descripcion}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Fecha preferida:{" "}
                  <span className="font-medium">
                    {solicitud.fechaPreferida || "-"}
                  </span>{" "}
                  · Hora preferida:{" "}
                  <span className="font-medium">
                    {solicitud.horaPreferida?.slice(0, 5) || "-"}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${urgenciaColor(
                    solicitud.urgencia
                  )}`}
                >
                  Urgencia: {solicitud.urgencia}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-white">
                  Estado actual: {solicitud.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Asignación y estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Asignado a */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Personal asignado
              </label>
              {loading ? (
                <div className="text-xs text-slate-500">Cargando...</div>
              ) : (
                <select
                  value={personaAsignado || ""}
                  onChange={(e) => setPersonaAsignado(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Sin asignar</option>
                  {personal.map((p) => (
                    <option
                      key={p.personalMantenimientoID}
                      value={p.personalMantenimientoID}
                    >
                      {p.nombrePersona} — {p.puesto}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estado de la solicitud
              </label>
              <select
                value={estado || "Pendiente"}
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

          {/* Notas admin */}
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

          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
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
