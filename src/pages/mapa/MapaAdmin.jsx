// src/pages/mapa/MapaAdmin.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import MarcadorForm from "./MarcadorForm";
import { useAuth } from "@/context/AuthContext";
import MapaContext from "@/context/Mapa/MapaContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";

// Importar imágenes de Leaflet
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Configurar iconos por defecto
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});
// ================================

// Colores por tipo de indicador
const indicadorConfig = {
  Peligroso: { color: "#ef4444", label: "Zona peligrosa" },
  Alerta: { color: "#f59e0b", label: "Zona de alerta" },
  Mantenimiento: { color: "#22c55e", label: "Zona de mantenimiento" },
};

const DEFAULT_CENTER = [21.116667, -101.683334];

// Radio del círculo según indicador (en metros)
function getRadius(indicador) {
  switch (indicador) {
    case "Peligroso":
      return 150;
    case "Alerta":
      return 120;
    case "Mantenimiento":
      return 100;
    default:
      return 100;
  }
}

// Componente para capturar clics en el mapa
function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

export default function MapaAdmin() {
  const { user } = useAuth();
  const {
    marcadores,
    loading,
    error,
    getMarcadores,
    addMarcador,
    updateMarcador,
    deleteMarcador,
    clearError,
  } = useContext(MapaContext);

  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState({
    marcadorID: null,
    latitud: "",
    longitud: "",
    indicador: "Peligroso",
    comentario: "",
  });

  // -------------- CARGA INICIAL ----------------
  useEffect(() => {
    getMarcadores();
  }, []);

  // -------------- MANEJO FORMULARIO ----------------
  const openCreateForm = () => {
    setMode("create");
    setForm({
      marcadorID: null,
      latitud: "",
      longitud: "",
      indicador: "Peligroso",
      comentario: "",
    });
    setFormOpen(true);
  };

  const openEditForm = (marcador) => {
    setMode("edit");
    setForm({
      marcadorID: marcador.marcadorID,
      latitud: marcador.latitud,
      longitud: marcador.longitud,
      indicador: marcador.indicador,
      comentario: marcador.comentario || "",
    });
    setFormOpen(true);
  };

  const handleMapClick = (latlng) => {
    if (!formOpen) return;
    setForm((prev) => ({
      ...prev,
      latitud: latlng.lat,
      longitud: latlng.lng,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const lat = Number(form.latitud);
    const lng = Number(form.longitud);

    if (!lat || !lng) {
      await Swal.fire({
        title: "Ubicación requerida",
        text: "Selecciona una ubicación en el mapa (latitud y longitud válidas).",
        icon: "warning",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (!form.comentario.trim()) {
      await Swal.fire({
        title: "Comentario requerido",
        text: "El comentario es obligatorio para describir la zona.",
        icon: "warning",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Entendido",
      });
      return;
    }

    try {
      const payload = {
        latitud: lat,
        longitud: lng,
        indicador: form.indicador,
        comentario: form.comentario.trim(),
      };

      if (mode === "create") {
        const usuarioID = user?.id || null;
        if (usuarioID != null) {
          payload.usuarioID = usuarioID;
        }

        // Mostrar confirmación antes de crear
        const result = await Swal.fire({
          title: "¿Crear nuevo marcador?",
          html: `
            <div class="text-left">
              <p><strong>Tipo:</strong> ${form.indicador}</p>
              <p><strong>Comentario:</strong> ${form.comentario.trim()}</p>
              <p><strong>Ubicación:</strong><br/>
              Lat: ${lat.toFixed(6)}<br/>
              Lng: ${lng.toFixed(6)}</p>
            </div>
          `,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#10b981",
          cancelButtonColor: "#ef4444",
          confirmButtonText: "Sí, crear",
          cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
          await addMarcador(payload);

          await Swal.fire({
            title: "¡Marcador creado!",
            text: "El marcador se ha agregado exitosamente al mapa.",
            icon: "success",
            confirmButtonColor: "#10b981",
          });

          setFormOpen(false);
        }
      } else {
        payload.marcadorID = form.marcadorID;

        // Mostrar confirmación antes de editar
        const result = await Swal.fire({
          title: "¿Actualizar marcador?",
          html: `
            <div class="text-left">
              <p><strong>Tipo:</strong> ${form.indicador}</p>
              <p><strong>Comentario:</strong> ${form.comentario.trim()}</p>
              <p><strong>Ubicación:</strong><br/>
              Lat: ${lat.toFixed(6)}<br/>
              Lng: ${lng.toFixed(6)}</p>
            </div>
          `,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#10b981",
          cancelButtonColor: "#ef4444",
          confirmButtonText: "Sí, actualizar",
          cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
          await updateMarcador(payload);

          await Swal.fire({
            title: "¡Marcador actualizado!",
            text: "El marcador se ha modificado exitosamente.",
            icon: "success",
            confirmButtonColor: "#10b981",
          });

          setFormOpen(false);
        }
      }
    } catch (err) {
      console.error("Error al guardar marcador:", err);

      await Swal.fire({
        title: "Error",
        text: "Ocurrió un error al guardar el marcador. Por favor, intenta nuevamente.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleDelete = async (marcador) => {
    const cfg = indicadorConfig[marcador.indicador] || {
      color: "#3b82f6",
      label: marcador.indicador,
    };

    const result = await Swal.fire({
      title: "¿Eliminar marcador?",
      html: `
        <div class="text-left">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-3 h-3 rounded-full" style="background-color: ${
              cfg.color
            }"></span>
            <span class="font-semibold">${cfg.label}</span>
          </div>
          <p><strong>Comentario:</strong> ${marcador.comentario}</p>
          <p><strong>Ubicación:</strong><br/>
          Lat: ${marcador.latitud.toFixed(6)}<br/>
          Lng: ${marcador.longitud.toFixed(6)}</p>
          <p class="mt-2 text-red-600 text-sm font-medium">Esta acción no se puede deshacer.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteMarcador(marcador.marcadorID);

        await Swal.fire({
          title: "¡Eliminado!",
          text: "El marcador ha sido eliminado exitosamente.",
          icon: "success",
          confirmButtonColor: "#10b981",
        });
      } catch (err) {
        await Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el marcador. Por favor, intenta nuevamente.",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  // Mostrar error con SweetAlert si existe
  useEffect(() => {
    if (error) {
      Swal.fire({
        title: "Error",
        text: error,
        icon: "error",
        confirmButtonColor: "#ef4444",
      }).then(() => {
        clearError();
      });
    }
  }, [error, clearError]);

  // Centro del mapa
  const center = useMemo(() => {
    if (marcadores.length > 0) {
      const m = marcadores[0];
      return [m.latitud, m.longitud];
    }
    return DEFAULT_CENTER;
  }, [marcadores]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mapa de zonas</h1>
          <p className="text-sm text-slate-500">
            Visualiza y administra las zonas peligrosas, de alerta y
            mantenimiento.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
        >
          + Nuevo marcador
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[500px]">
        {/* MAPA */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          {!loading ? (
            <MapContainer
              center={center}
              zoom={15}
              style={{ height: "100%", minHeight: "400px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              <ClickHandler onClick={handleMapClick} />

              {marcadores.map((m) => {
                const cfg = indicadorConfig[m.indicador] || {
                  color: "#3b82f6",
                  label: m.indicador,
                };

                return (
                  <div key={m.marcadorID}>
                    <Circle
                      center={[m.latitud, m.longitud]}
                      radius={getRadius(m.indicador)}
                      pathOptions={{
                        color: cfg.color,
                        fillColor: cfg.color,
                        fillOpacity: 0.25,
                      }}
                    >
                      <Tooltip sticky>
                        <div className="text-xs">
                          <div className="font-semibold">{cfg.label}</div>
                          <div>{m.comentario}</div>
                        </div>
                      </Tooltip>
                    </Circle>

                    <Marker position={[m.latitud, m.longitud]}>
                      <Popup>
                        <div className="space-y-1 text-sm">
                          <div className="font-semibold">
                            {cfg.label} ({m.indicador})
                          </div>
                          <div>{m.comentario}</div>
                          <div className="text-xs text-slate-500">
                            Lat: {m.latitud.toFixed(6)} | Lng:{" "}
                            {m.longitud.toFixed(6)}
                          </div>
                          <button
                            onClick={() => openEditForm(m)}
                            className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                          >
                            Editar marcador
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            className="ml-2 inline-flex items-center px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  </div>
                );
              })}
            </MapContainer>
          ) : (
            <div className="h-full grid place-items-center text-slate-500 text-sm">
              Cargando mapa...
            </div>
          )}
        </div>

        {/* PANEL LATERAL */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* FORMULARIO SEPARADO */}
          <MarcadorForm
            open={formOpen}
            mode={mode}
            form={form}
            saving={loading}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onClose={() => setFormOpen(false)}
          />
          {/* LEYENDA */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-sm">
            <h2 className="font-semibold text-slate-800 mb-3">
              Leyenda de indicadores
            </h2>
            <div className="space-y-2">
              {Object.entries(indicadorConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className="font-medium text-slate-700">{key}</span>
                  <span className="text-slate-400">– {cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LISTA DE MARCADORES */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex-1 overflow-y-auto">
            <h2 className="font-semibold text-slate-800 mb-3 text-sm">
              Marcadores activos ({marcadores.length})
            </h2>
            {marcadores.length === 0 ? (
              <p className="text-xs text-slate-500">
                No hay marcadores activos. Agrega uno nuevo desde el botón
                "Nuevo marcador".
              </p>
            ) : (
              <ul className="space-y-3 text-xs">
                {marcadores.map((m) => {
                  const cfg = indicadorConfig[m.indicador] || {
                    color: "#3b82f6",
                    label: m.indicador,
                  };
                  return (
                    <li
                      key={m.marcadorID}
                      className="border border-slate-100 rounded-xl p-3 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cfg.color }}
                          />
                          <span className="font-semibold text-slate-800">
                            {cfg.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          ID: {m.marcadorID}
                        </span>
                      </div>
                      <div className="text-slate-600">{m.comentario}</div>
                      <div className="text-[11px] text-slate-400">
                        Lat: {m.latitud.toFixed(5)} | Lng:{" "}
                        {m.longitud.toFixed(5)}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => openEditForm(m)}
                          className="flex-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-semibold hover:bg-emerald-100"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
                          className="flex-1 px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 text-[11px] font-semibold hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
