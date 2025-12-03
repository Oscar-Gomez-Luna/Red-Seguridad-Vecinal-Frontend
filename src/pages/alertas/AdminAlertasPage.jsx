import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AlertasContext from "@/context/Alertas/AlertasContext";
import Swal from "sweetalert2";

export default function AdminAlertasPage() {
  const {
    alertas,
    loading,
    error,
    notification,
    getAlertas,
    atenderAlerta,
    isAlertaActiva,
    clearError,
    clearNotification,
  } = useContext(AlertasContext);

  const [selectedAlerta, setSelectedAlerta] = useState(null);

  useEffect(() => {
    getAlertas();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => clearNotification(), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const alertasOrdenadas = useMemo(() => {
    return [...alertas].sort(
      (a, b) => (isAlertaActiva(b) ? 1 : 0) - (isAlertaActiva(a) ? 1 : 0)
    );
  }, [alertas, isAlertaActiva]);

  const estadisticas = useMemo(() => {
    const hoy = new Date().toDateString();
    const totalHoy = alertas.filter(
      (a) => new Date(a.fechaHora).toDateString() === hoy
    ).length;
    const totalActivas = alertas.filter(isAlertaActiva).length;

    return { totalHoy, totalActivas };
  }, [alertas, isAlertaActiva]);

  const handleAtender = async (alerta) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Confirmar Atención de Alerta",
      html: `¿Estás seguro de marcar la alerta <strong>#${alerta.alertaID}</strong> del vecino <strong>"${alerta.nombreUsuario}"</strong> como atendida?`,
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, atender",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await atenderAlerta(alerta.alertaID);
        await Swal.fire({
          icon: "success",
          title: "¡Alerta atendida!",
          text: "La alerta ha sido marcada como atendida correctamente",
          confirmButtonColor: "#10B981",
          confirmButtonText: "Entendido",
        });
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo atender la alerta",
          confirmButtonColor: "#EF4444",
          confirmButtonText: "Entendido",
        });
      }
    }
  };

  const formatFecha = (fecha) => {
    return fecha ? new Date(fecha).toLocaleString() : "—";
  };

  const getEstadoStyles = (alerta) => {
    return isAlertaActiva(alerta)
      ? "bg-red-100 text-red-700 border border-red-200"
      : "bg-emerald-100 text-emerald-700 border border-emerald-200";
  };

  const columns = [
    {
      header: "Folio",
      accessor: (alerta) => (
        <span className="font-mono font-semibold">#{alerta.alertaID}</span>
      ),
    },
    {
      header: "Fecha/Hora",
      accessor: (alerta) => formatFecha(alerta.fechaHora),
    },
    {
      header: "Vecino",
      accessor: (alerta) =>
        alerta.nombreUsuario || `Usuario #${alerta.usuarioID}`,
    },
    {
      header: "Estado",
      accessor: (alerta) => (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getEstadoStyles(
            alerta
          )}`}
        >
          {isAlertaActiva(alerta) ? "Activa" : "Atendida"}
        </span>
      ),
    },
    {
      header: "Acciones",
      accessor: (alerta) => (
        <div className="flex gap-2">
          <Link
            to={`/admin/alertas/${alerta.alertaID}`}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#F97316] text-white text-xs font-semibold hover:bg-[#ea580c] transition-colors"
          >
            Detalle
          </Link>
          <button
            onClick={() => handleAtender(alerta)}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#10B981] text-white text-xs font-semibold hover:bg-[#059669] transition-colors"
          >
            Atender
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 md:px-8 pb-10">
      <header className="pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827]">
          Centro de Alertas de Pánico
        </h1>
        <p className="mt-1 text-slate-500 max-w-3xl">
          Gestiona y atiende las alertas de emergencia reportadas por los
          residentes.
        </p>
      </header>

      {notification && (
        <div
          className={`mb-4 p-4 rounded-2xl border ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-lg ${
                notification.type === "success"
                  ? "text-emerald-600"
                  : "text-blue-600"
              }`}
            >
              {notification.type === "success" ? "✓" : "i"}
            </span>
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  notification.type === "success"
                    ? "text-emerald-800"
                    : "text-blue-800"
                }`}
              >
                {notification.message}
              </p>
            </div>
            <button
              onClick={clearNotification}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <section className="mb-6">
        <div className="bg-[#EF4444] text-white rounded-3xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-xl font-bold">Alertas de Emergencia</h2>
            <p className="text-red-100 text-sm md:text-base">
              Monitorea y responde rápidamente a las situaciones de pánico.
            </p>
          </div>
          <button
            onClick={getAlertas}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/30 text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <span>⟳</span>
            <span>{loading ? "Actualizando..." : "Actualizar"}</span>
          </button>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#047857] text-white rounded-2xl p-6 shadow-sm">
          <div className="text-sm opacity-90">Total de Alertas</div>
          <div className="text-3xl font-bold">{alertas.length}</div>
        </div>
        <div className="bg-[#F97316] text-white rounded-2xl p-6 shadow-sm">
          <div className="text-sm opacity-90">Alertas Hoy</div>
          <div className="text-3xl font-bold">{estadisticas.totalHoy}</div>
        </div>
        <div
          className={`rounded-2xl p-6 shadow-sm text-white ${
            estadisticas.totalActivas > 0 ? "bg-[#EF4444]" : "bg-[#10B981]"
          }`}
        >
          <div className="text-sm opacity-90">Alertas Activas</div>
          <div className="text-3xl font-bold">{estadisticas.totalActivas}</div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-[#047857] text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-3 flex">
          {columns.map((col, index) => (
            <div
              key={index}
              className="flex-1 text-center first:text-left last:text-right"
            >
              {col.header}
            </div>
          ))}
        </div>

        {loading && alertas.length === 0 ? (
          <div className="px-4 md:px-6 py-8 text-sm text-slate-500 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-[#F97316] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : error ? (
          <div className="px-4 md:px-6 py-6 text-sm text-red-600 text-center">
            {error}
            <button
              onClick={clearError}
              className="ml-2 text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        ) : alertasOrdenadas.length === 0 ? (
          <div className="px-4 md:px-6 py-8 text-sm text-slate-500 text-center">
            No hay alertas registradas
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {alertasOrdenadas.map((alerta) => (
              <li
                key={alerta.alertaID}
                className="px-4 md:px-6 py-4 text-xs md:text-sm hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-center gap-4">
                  {columns.map((col, index) => (
                    <div
                      key={index}
                      className="flex-1 text-center first:text-left last:text-right"
                    >
                      {col.accessor(alerta)}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
