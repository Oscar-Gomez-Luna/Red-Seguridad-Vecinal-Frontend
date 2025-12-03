import { useEffect, useState } from "react";
import ServiciosAPI from "../../services/servicios.api";

export default function AsignacionForm({
  open,
  onClose,
  solicitud,
  onUpdated,
}) {
  const [catalogoServicios, setCatalogoServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [personaAsignado, setPersonaAsignado] = useState("");
  const [estado, setEstado] = useState("");
  const [notasAdmin, setNotasAdmin] = useState("");

  const [mostrarMonto, setMostrarMonto] = useState(false);
  const [montoCargo, setMontoCargo] = useState("");
  const [conceptoCargo, setConceptoCargo] = useState("");

  useEffect(() => {
    if (!open || !solicitud) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        
        const res = await ServiciosAPI.getCatalogoServicios();
        setCatalogoServicios(res || []);

        setPersonaAsignado(solicitud.personaAsignado || "");
        setEstado(solicitud.estado || "Pendiente");
        setNotasAdmin(solicitud.notasAdmin || "");

      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el catálogo de servicios.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, solicitud]);

  if (!open || !solicitud) return null;

  const handleEstadoChange = (nuevoEstado) => {
    setEstado(nuevoEstado);
    
    if (nuevoEstado === "Completada" && estado !== "Completada") {
      const conceptoBase = `Servicio: ${solicitud.tipoServicioNombre} - ${solicitud.descripcion.substring(0, 50)}${solicitud.descripcion.length > 50 ? '...' : ''}`;
      setConceptoCargo(conceptoBase);
      setMostrarMonto(true);
    }
  };

  const handleCompletarConCargo = async () => {
    if (!montoCargo || parseFloat(montoCargo) <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const promises = [];

      if (personaAsignado && Number(personaAsignado) !== Number(solicitud.personaAsignado)) {
        promises.push(
          ServiciosAPI.asignarSolicitudServicio(
            solicitud.solicitudID,
            Number(personaAsignado)
          )
        );
      }

      promises.push(
        ServiciosAPI.completarSolicitudServicio(
          solicitud.solicitudID,
          notasAdmin?.trim() || null
        )
      );

      await Promise.all(promises);

      const cargoData = {
        usuarioID: solicitud.usuarioID,
        solicitudID: solicitud.solicitudID,
        concepto: conceptoCargo,
        monto: parseFloat(montoCargo)
      };

      await ServiciosAPI.crearCargoServicio(cargoData);

      if (onUpdated) await onUpdated();
      setMostrarMonto(false);
      onClose();

    } catch (err) {
      console.error(err);
      setError("Error al completar la solicitud y crear el cargo.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (estado === "Completada") {
      handleEstadoChange("Completada");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const promises = [];

      if (personaAsignado && Number(personaAsignado) !== Number(solicitud.personaAsignado)) {
        promises.push(
          ServiciosAPI.asignarSolicitudServicio(
            solicitud.solicitudID,
            Number(personaAsignado)
          )
        );
      }

      if (estado && estado !== solicitud.estado) {
        promises.push(
          ServiciosAPI.actualizarEstadoSolicitud(solicitud.solicitudID, estado)
        );
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      if (onUpdated) await onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al guardar los cambios.");
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
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Encargado asignado
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
                    {catalogoServicios.map((s) => (
                      <option
                        key={s.servicioID}
                        value={s.servicioID}
                      >
                        {s.nombreEncargado} — {s.tipoServicioNombre || s.tipoServicioID}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Selecciona del catálogo de servicios
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estado de la solicitud
                </label>
                <select
                  value={estado || "Pendiente"}
                  onChange={(e) => handleEstadoChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Al marcar <strong>Completada</strong> se generará un cargo.
                </p>
              </div>
            </div>

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

      {/* Modal para monto */}
      {mostrarMonto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-5 max-w-md w-full mx-4">
            <h3 className="font-semibold text-lg mb-3">Cargo por servicio completado</h3>
            <p className="text-sm text-slate-600 mb-4">
              La solicitud #{solicitud.solicitudID} será marcada como completada y se generará un cargo para el residente.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Concepto</label>
                <input
                  type="text"
                  value={conceptoCargo}
                  onChange={(e) => setConceptoCargo(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Descripción del cargo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Monto ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={montoCargo}
                  onChange={(e) => setMontoCargo(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setMostrarMonto(false);
                  setEstado(solicitud.estado);
                }}
                className="px-4 py-2 text-sm border rounded-lg"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCompletarConCargo}
                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-70"
                disabled={saving}
              >
                {saving ? "Procesando..." : "Completar y generar cargo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}