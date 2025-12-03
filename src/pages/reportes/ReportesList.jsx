import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ReportesContext from "../../context/Reportes/ReportesContext";
import CategoriaSeleccionModal from "../../components/CategoriaSeleccionModal";
import Swal from "sweetalert2";

const Badge = ({ children, className = "" }) => (
  <span
    className={
      "px-2.5 py-1.5 text-sm font-semibold rounded-full border " + className
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

const TipoBadge = ({ tipo }) => {
  const map =
    {
      Robo: "bg-rose-50 text-rose-700 border-rose-200",
      Vandalismo: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Incidente: "bg-cyan-50 text-cyan-700 border-cyan-200",
    }[tipo] || "bg-slate-50 text-slate-700 border-slate-200";
  return <Badge className={map}>{tipo || "Tipo"}</Badge>;
};

export default function ReportesList() {
  const nav = useNavigate();
  const {
    reportes,
    tiposReporte,
    loading,
    error,
    fetchReportes,
    fetchTiposReporte,
    marcarVisto,
    prepararMarcarComoAtendido,
    showCategoriaModal,
    pendingReporte,
    confirmarMarcarComoAtendido,
    setShowCategoriaModal,
  } = useContext(ReportesContext);

  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("all");
  const [estado, setEstado] = useState("all");

  // Cargar datos SOLO al inicio
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchReportes(), fetchTiposReporte()]);
    };
    loadData();
  }, []); // Solo al montar

  const filtered = useMemo(() => {
    return reportes
      .filter((r) =>
        q.trim()
          ? `${r.titulo} ${r.descripcion} ${r.nombreUsuario} ${r.direccionTexto} ${r.tipoReporte}`
              .toLowerCase()
              .includes(q.toLowerCase())
          : true
      )
      .filter((r) => (tipo === "all" ? true : r.tipoReporteID === Number(tipo)))
      .filter((r) =>
        estado === "all" ? true : estado === "pendiente" ? !r.visto : r.visto
      )
      .sort(
        (a, b) =>
          new Date(b.fechaCreacion).getTime() -
          new Date(a.fechaCreacion).getTime()
      );
  }, [reportes, q, tipo, estado]);

  const handleMarcarVisto = async (r) => {
    const newVal = !r.visto;

    if (newVal) {
      // Para marcar como atendido, mostrar confirmación con SweetAlert
      const result = await Swal.fire({
        icon: "question",
        title: "¿Marcar como atendido?",
        html: `
          <p>El reporte <strong>"${r.titulo}"</strong> será marcado como ATENDIDO.</p>
          <p class="mt-2">Se abrirá un modal para seleccionar la categoría del aviso que se creará.</p>
        `,
        showCancelButton: true,
        confirmButtonColor: "#10B981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        prepararMarcarComoAtendido(r);
      }
    } else {
      // Para marcar como pendiente, confirmación simple
      const result = await Swal.fire({
        icon: "warning",
        title: "¿Marcar como pendiente?",
        text: `¿Deseas marcar el reporte "${r.titulo}" como PENDIENTE?`,
        showCancelButton: true,
        confirmButtonColor: "#FBBF24",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, marcar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        try {
          await marcarVisto(r.reporteID, false);
          await Swal.fire({
            icon: "success",
            title: "¡Reporte actualizado!",
            text: "El reporte ha sido marcado como pendiente",
            confirmButtonColor: "#10B981",
            confirmButtonText: "Entendido",
          });
        } catch (e) {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: e.message || "No se pudo actualizar el estado del reporte",
            confirmButtonColor: "#EF4444",
            confirmButtonText: "Entendido",
          });
        }
      }
    }
  };

  return (
    <div className="p-5 md:p-7">
      {/* Header */}
      <div className="rounded-2xl shadow-sm mb-5 border border-[#047857] bg-[#047857] text-white">
        <div className="px-5 md:px-7 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              Reportes de la comunidad
            </h1>
            <p className="opacity-90 text-base mt-0.5">
              Revisa, atiende y marca el estado de los reportes enviados por
              vecinos.
            </p>
          </div>
          <button
            onClick={() => Promise.all([fetchReportes(), fetchTiposReporte()])}
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2.5 text-base font-medium
                       bg-white/10 text-white hover:bg-white/20 active:scale-95 transition"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M21 12a9 9 0 1 1-3-6.7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 3v6h-6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Recargar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="md:col-span-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, descripción, dirección o usuario…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F97316]"
          />
        </div>
        <select
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F97316]"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="all">Todos los tipos</option>
          {tiposReporte.map((t) => (
            <option key={t.tipoReporteID} value={t.tipoReporteID}>
              {t.nombre}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F97316]"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="atendido">Atendido</option>
        </select>
      </div>

      {/* Contenido */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        {loading ? (
          <div className="p-10 grid place-items-center">
            <div className="animate-spin h-7 w-7 border-2 border-[#F97316] border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="p-6 text-rose-600 text-base">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-base">
            No hay reportes con los filtros actuales.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <li
                key={r.reporteID}
                className="p-5 md:p-6 transition rounded-xl hover:bg-[#F9FAFB]"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg md:text-xl font-semibold text-slate-800">
                        {r.titulo}
                      </h3>
                      <EstadoBadge visto={r.visto} />
                      <TipoBadge tipo={r.tipoReporte} />
                      {r.visto && (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          Aviso creado
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-base text-slate-700 line-clamp-2">
                      {r.descripcion}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-base text-slate-600">
                      <span>{r.direccionTexto}</span>
                      <span>•</span>
                      <span>
                        {new Date(r.fechaCreacion).toLocaleDateString()}
                      </span>
                      {r.nombreUsuario && (
                        <>
                          <span>•</span>
                          <span>Por: {r.nombreUsuario}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => nav(`/admin/reportes/${r.reporteID}`)}
                      className="px-4 py-2.5 text-base rounded-xl border border-[#F97316] bg-[#F97316] text-white
                                 hover:bg-[#ea580c] active:scale-95 transition"
                    >
                      Ver Detalle
                    </button>

                    <button
                      onClick={() => handleMarcarVisto(r)}
                      className={`px-4 py-2.5 text-base rounded-xl border active:scale-95 transition
                                  ${
                                    r.visto
                                      ? "border-[#10B981] bg-[#10B981] text-white hover:bg-[#059669]"
                                      : "border-[#FBBF24] bg-[#FBBF24] text-[#111827] hover:bg-[#f59e0b]"
                                  }`}
                    >
                      {r.visto
                        ? "Marcar como pendiente"
                        : "Marcar como atendido"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal de selección de categoría */}
      <CategoriaSeleccionModal
        open={showCategoriaModal}
        onClose={() => setShowCategoriaModal(false)}
        reporte={pendingReporte}
        onConfirm={async (categoriaID) => {
          if (pendingReporte) {
            try {
              await confirmarMarcarComoAtendido(categoriaID);
              await Swal.fire({
                icon: "success",
                title: "¡Reporte atendido!",
                text: "El reporte ha sido marcado como atendido y se ha creado un aviso para la comunidad",
                confirmButtonColor: "#10B981",
                confirmButtonText: "Entendido",
              });
            } catch (error) {
              await Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "No se pudo completar la acción",
                confirmButtonColor: "#EF4444",
                confirmButtonText: "Entendido",
              });
            }
          }
        }}
      />
    </div>
  );
}
