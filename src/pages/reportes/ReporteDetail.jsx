import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReportesContext from "../../context/Reportes/ReportesContext";
import CategoriaSeleccionModal from "../../components/CategoriaSeleccionModal";

// Paleta base usada
const COLORS = {
  primary: "#047857", // verde fuerte
  light: "#10B981", // verde claro
  action: "#F97316", // naranja
  warning: "#FBBF24", // amarillo
  text: "#111827",
  sky100: "#E0F2FE", // azul cielo muy claro
  sky700: "#0369A1",
  amber100: "#FEF3C7",
  amber700: "#B45309",
};

const Section = ({ title, children, right, headerBg, headerText }) => (
  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
    <div
      className="px-4 md:px-6 py-3 flex items-center justify-between"
      style={{
        backgroundColor: headerBg || "transparent",
        color: headerText || COLORS.text,
      }}
    >
      <h2 className="font-semibold">{title}</h2>
      <div className="flex items-center gap-2">{right}</div>
    </div>
    <div className="p-4 md:p-6">{children}</div>
  </div>
);

const Badge = ({ children, className = "" }) => (
  <span
    className={
      "px-2 py-1 text-xs font-semibold rounded-full border " + className
    }
  >
    {children}
  </span>
);

const EstadoBadge = ({ visto }) =>
  visto ? (
    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
      Atendido
    </Badge>
  ) : (
    <Badge className="bg-amber-50 text-amber-700 border-amber-200">
      Pendiente
    </Badge>
  );

const Row = ({ label, value, mono }) => (
  <div className="grid grid-cols-12 gap-2 py-2">
    <div className="col-span-12 md:col-span-4 text-slate-500 text-sm">
      {label}
    </div>
    <div className={`col-span-12 md:col-span-8 ${mono ? "font-mono" : ""}`}>
      {value}
    </div>
  </div>
);

export default function ReporteDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);

  const {
    reporteActual: item,
    loading,
    error,
    fetchReporteById,
    marcarVisto,
    marcarVistoConCategoria,
  } = useContext(ReportesContext);

  useEffect(() => {
    if (id) {
      fetchReporteById(Number(id));
    }
  }, [id]);

  const gmapsUrl = useMemo(() => {
    if (!item) return "#";
    return `https://www.google.com/maps?q=${item.latitud},${item.longitud}`;
  }, [item]);

  const onVisto = async () => {
    if (!item) return;

    const newVal = !item.visto;

    if (newVal) {
      // Para marcar como atendido, mostrar modal de categoría
      setShowCategoriaModal(true);
    } else {
      // Para marcar como pendiente, confirmación simple
      const confirmar = window.confirm(
        `¿Marcar el reporte "${item.titulo}" como PENDIENTE?`
      );

      if (confirmar) {
        try {
          await marcarVisto(item.reporteID, false);
          alert("Reporte marcado como pendiente.");
          fetchReporteById(Number(id));
        } catch (e) {
          alert("Error: " + (e.message || "No se pudo actualizar el estado"));
        }
      }
    }
  };

  const copyCoords = async () => {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(`${item.latitud}, ${item.longitud}`);
      alert("Coordenadas copiadas");
    } catch {
      alert("No se pudo copiar");
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header y acciones */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800">
            Detalle del reporte #{id}
          </h1>
          {item && (
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <EstadoBadge visto={item.visto} />
              <Badge className="bg-slate-50 text-slate-700 border-slate-200">
                {item.tipoReporte || "Tipo"}
              </Badge>
              {item.visto && (
                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                  Aviso creado
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => nav(-1)}
            className="px-3 py-2 text-sm rounded-lg border border-[#047857] bg-[#047857] text-white
                       active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            Volver
          </button>
          <button
            onClick={() => fetchReporteById(Number(id))}
            className="px-3 py-2 text-sm rounded-lg border border-[#10B981] bg-[#10B981] text-white
                       active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
            title="Recargar"
          >
            Recargar
          </button>
          {item && (
            <button
              onClick={onVisto}
              className={`px-3 py-2 text-sm rounded-lg border active:scale-95 transition
                          focus:outline-none focus:ring-2 focus:ring-emerald-300
                          ${
                            item.visto
                              ? "border-[#10B981] bg-[#10B981] text-white"
                              : "border-[#FBBF24] bg-[#FBBF24] text-[#111827]"
                          }`}
            >
              {item.visto ? "Marcar como pendiente" : "Marcar atendido"}
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 grid place-items-center">
          <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded-2xl shadow-sm p-6 text-rose-600">
          {error}
        </div>
      ) : !item ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          No se encontró el reporte.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Columna izquierda (detalle) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Información general — VERDE CLARO */}
            <Section
              title="Información general"
              headerBg={COLORS.light}
              headerText="#ffffff"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-800">
                  {item.titulo}
                </h3>
                <p className="text-slate-600">{item.descripcion}</p>
              </div>

              <div className="mt-4">
                <Row
                  label="Fecha de creación"
                  value={new Date(item.fechaCreacion).toLocaleString()}
                />
                <Row
                  label="Reportado por"
                  value={item.nombreUsuario || "Anónimo"}
                />
                <Row label="Correo" value={item.email || "—"} />
                <Row label="Teléfono" value={item.telefono || "—"} />
                <Row
                  label="Domicilio"
                  value={`${item.calle || ""} ${item.numeroCasa || ""}`}
                />
                <Row
                  label="Estado"
                  value={
                    <div className="flex items-center gap-2">
                      <EstadoBadge visto={item.visto} />
                      {item.visto && (
                        <span className="text-sm text-blue-600">
                          Aviso creado automáticamente
                        </span>
                      )}
                    </div>
                  }
                />
              </div>
            </Section>

            {/* Ubicación — AZUL CIELO MUY CLARO */}
            <Section
              title="Ubicación"
              headerBg={COLORS.sky100}
              headerText={COLORS.sky700}
              right={
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCoords}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200
                               bg-white active:scale-95 transition"
                  >
                    Copiar coordenadas
                  </button>
                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-xs rounded-lg border border-[#047857]
                               bg-[#047857] text-white active:scale-95 transition"
                  >
                    Abrir en Maps
                  </a>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Row label="Dirección" value={item.direccionTexto} />
                  <Row
                    label="Coordenadas"
                    value={`${item.latitud}, ${item.longitud}`}
                    mono
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <iframe
                    title="map"
                    className="w-full h-52"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${item.latitud},${item.longitud}&output=embed`}
                  />
                </div>
              </div>
            </Section>

            {item.imagen && (
              <Section title="Evidencia">
                <div className="rounded-xl overflow-hidden border border-slate-200 max-w-xl">
                  <img
                    src={item.imagen}
                    alt="Evidencia"
                    className="w-full h-auto"
                  />
                </div>
              </Section>
            )}
          </div>

          {/* Columna derecha (resumen) */}
          <div className="space-y-5">
            {/* Estado — AMARILLO CLARO */}
            <Section
              title="Estado"
              headerBg={COLORS.amber100}
              headerText={COLORS.amber700}
            >
              <div className="flex items-center gap-2 mb-3">
                <EstadoBadge visto={item.visto} />
                <Badge className="bg-slate-50 text-slate-700 border-slate-200">
                  {item.tipoReporte}
                </Badge>
                {item.visto && (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    Aviso creado
                  </Badge>
                )}
              </div>

              <div className="mb-3">
                {item.visto ? (
                  <div className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    Este reporte ha sido atendido y se ha creado un aviso para
                    la comunidad.
                  </div>
                ) : (
                  <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    Este reporte está pendiente de atención.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={onVisto}
                  className={`px-3 py-2 text-sm rounded-lg border active:scale-95 transition
                              focus:outline-none focus:ring-2 focus:ring-emerald-300
                              ${
                                item.visto
                                  ? "border-[#10B981] bg-[#10B981] text-white"
                                  : "border-[#FBBF24] bg-[#FBBF24] text-[#111827]"
                              }`}
                >
                  {item.visto ? "Marcar pendiente" : "Marcar atendido"}
                </button>
              </div>
            </Section>

            {/* Acciones rápidas — AMARILLO CLARO */}
            <Section
              title="Acciones rápidas"
              headerBg={COLORS.amber100}
              headerText={COLORS.amber700}
            >
              <div className="flex flex-col gap-2">
                <a
                  className="px-3 py-2 text-sm rounded-lg border border-[#047857] bg-[#047857] text-white
                             w-max active:scale-95 transition"
                  href={gmapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver ubicación en Google Maps
                </a>
                <button
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-slate-100 text-slate-800
                             w-max active:scale-95 transition"
                  onClick={() => nav("/admin/reportes")}
                >
                  Volver a la lista
                </button>
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* Modal de selección de categoría */}
      <CategoriaSeleccionModal
        open={showCategoriaModal}
        onClose={() => setShowCategoriaModal(false)}
        reporte={item}
        onConfirm={async (categoriaID) => {
          try {
            await marcarVistoConCategoria(item.reporteID, categoriaID);
            alert(
              "Reporte marcado como atendido. Se ha creado un aviso para la comunidad."
            );
            fetchReporteById(Number(id));
          } catch (error) {
            alert(
              "Error: " + (error.message || "No se pudo completar la acción")
            );
          }
        }}
      />
    </div>
  );
}
