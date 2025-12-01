import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AlertasContext from "@/context/Alertas/AlertasContext";
import ConfirmModal from "@/components/modals/ConfirmModal";

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
  const [showConfirm, setShowConfirm] = useState(false);

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
    return [...alertas].sort((a, b) => (isAlertaActiva(b) ? 1 : 0) - (isAlertaActiva(a) ? 1 : 0));
  }, [alertas, isAlertaActiva]);

  const estadisticas = useMemo(() => {
    const hoy = new Date().toDateString();
    const totalHoy = alertas.filter(a => new Date(a.fechaHora).toDateString() === hoy).length;
    const totalActivas = alertas.filter(isAlertaActiva).length;
    
    return { totalHoy, totalActivas };
  }, [alertas, isAlertaActiva]);

  const handleAtender = (alerta) => {
    setSelectedAlerta(alerta);
    setShowConfirm(true);
  };

  const confirmarAtencion = async () => {
    if (!selectedAlerta) return;
    await atenderAlerta(selectedAlerta.alertaID);
    setShowConfirm(false);
    setSelectedAlerta(null);
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
      ) 
    },
    { 
      header: "Fecha/Hora", 
      accessor: (alerta) => formatFecha(alerta.fechaHora) 
    },
    { 
      header: "Vecino", 
      accessor: (alerta) => alerta.nombreUsuario || `Usuario #${alerta.usuarioID}` 
    },
    { 
      header: "Estado", 
      accessor: (alerta) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getEstadoStyles(alerta)}`}>
          {isAlertaActiva(alerta) ? "Activa" : "Atendida"}
        </span>
      ) 
    },
    { 
      header: "Acciones", 
      accessor: (alerta) => (
        <div className="flex gap-2">
          <Link
            to={`/admin/alertas/${alerta.alertaID}`}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors"
          >
            Detalle
          </Link>
          <button
            onClick={() => handleAtender(alerta)}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Atender
          </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="px-4 md:px-8 pb-10">
      <header className="pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Centro de Alertas de Pánico
        </h1>
        <p className="mt-1 text-slate-500 max-w-3xl">
          Gestiona y atiende las alertas de emergencia reportadas por los residentes.
        </p>
      </header>

      {notification && (
        <div className={`mb-4 p-4 rounded-2xl border ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-lg ${notification.type === 'success' ? 'text-green-600' : 'text-blue-600'}`}>
              {notification.type === 'success' ? '✓' : 'i'}
            </span>
            <div className="flex-1">
              <p className={`font-semibold ${notification.type === 'success' ? 'text-green-800' : 'text-blue-800'}`}>
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
        <div className="bg-red-600 text-white rounded-3xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
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
        <div className="bg-amber-500 text-white rounded-2xl p-6 shadow-sm">
          <div className="text-sm opacity-90">Total de Alertas</div>
          <div className="text-3xl font-bold">{alertas.length}</div>
        </div>
        <div className="bg-amber-500 text-white rounded-2xl p-6 shadow-sm">
          <div className="text-sm opacity-90">Alertas Hoy</div>
          <div className="text-3xl font-bold">{estadisticas.totalHoy}</div>
        </div>
        <div className={`rounded-2xl p-6 shadow-sm text-white ${
          estadisticas.totalActivas > 0 ? 'bg-red-500' : 'bg-emerald-500'
        }`}>
          <div className="text-sm opacity-90">Alertas Activas</div>
          <div className="text-3xl font-bold">{estadisticas.totalActivas}</div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-emerald-700 text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-3 flex">
          {columns.map((col, index) => (
            <div key={index} className="flex-1 text-center first:text-left last:text-right">
              {col.header}
            </div>
          ))}
        </div>

        {loading && alertas.length === 0 ? (
          <div className="px-4 md:px-6 py-8 text-sm text-slate-500 text-center">
            Cargando alertas...
          </div>
        ) : error ? (
          <div className="px-4 md:px-6 py-6 text-sm text-red-600 text-center">
            {error}
            <button onClick={clearError} className="ml-2 text-red-400 hover:text-red-300">✕</button>
          </div>
        ) : alertasOrdenadas.length === 0 ? (
          <div className="px-4 md:px-6 py-8 text-sm text-slate-500 text-center">
            No hay alertas registradas
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {alertasOrdenadas.map((alerta) => (
              <li key={alerta.alertaID} className="px-4 md:px-6 py-4 text-xs md:text-sm hover:bg-red-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  {columns.map((col, index) => (
                    <div key={index} className="flex-1 text-center first:text-left last:text-right">
                      {col.accessor(alerta)}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmarAtencion}
        title="Confirmar Atención de Alerta"
        confirmText="Atender Alerta"
        cancelText="Cancelar"
        message={
          selectedAlerta 
            ? `¿Estás seguro de marcar la alerta #${selectedAlerta.alertaID} del vecino "${selectedAlerta.nombreUsuario}" como atendida?`
            : ""
        }
      />
    </div>
  );
}