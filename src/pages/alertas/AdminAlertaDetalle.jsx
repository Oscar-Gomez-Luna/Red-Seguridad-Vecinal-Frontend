import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AlertasContext from "@/context/Alertas/AlertasContext";
import Swal from "sweetalert2";

export default function AdminAlertaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { alertas, atenderAlerta } = useContext(AlertasContext);

  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    if (id) {
      const encontrada = alertas.find((a) => String(a.alertaID) === String(id));
      setAlerta(encontrada || null);
    }
  }, [id, alertas]);

  const cerrarDetalle = () => {
    navigate("/admin/alertas", { replace: true });
  };

  const handleAtender = async () => {
    if (!alerta) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Confirmar Atención",
      html: `¿Estás seguro de marcar la alerta <strong>#${alerta.alertaID}</strong> como atendida?`,
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, atender",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await atenderAlerta(alerta.firebaseID);
        await Swal.fire({
          icon: "success",
          title: "¡Alerta atendida!",
          text: "La alerta ha sido marcada como atendida correctamente",
          confirmButtonColor: "#10B981",
          confirmButtonText: "Entendido",
        });
        cerrarDetalle();
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

  const formatFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleString() : "—";

  const DetalleItem = ({ label, value }) => (
    <div className="flex gap-4 py-2">
      <div className="w-32 text-slate-500 font-medium">{label}</div>
      <div className="flex-1 font-semibold text-[#111827]">{value}</div>
    </div>
  );

  if (!alerta) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-8 w-8 border-2 border-[#F97316] border-t-transparent rounded-full" />
            <p className="text-center text-slate-600">Cargando alerta...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={cerrarDetalle} />

      <div className="relative w-[95%] max-w-2xl bg-white rounded-2xl shadow-2xl">
        <div className="bg-[#EF4444] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold">Alerta #{alerta.alertaID}</h2>

          <button
            onClick={cerrarDetalle}
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-white/10 transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1">
            <DetalleItem label="Folio" value={`#${alerta.alertaID}`} />
            <DetalleItem
              label="Fecha/Hora"
              value={formatFecha(alerta.fechaHora)}
            />
            <DetalleItem label="Vecino" value={alerta.nombreUsuario} />
            <DetalleItem
              label="Ubicación"
              value={`${alerta.latitud || "—"}, ${alerta.longitud || "—"}`}
            />

            <div className="flex gap-4 py-2">
              <div className="w-32 text-slate-500 font-medium">Estado</div>
              <div className="flex-1">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    (alerta?.estatus ?? "").toLowerCase() === "activa"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {(alerta?.estatus ?? "").toLowerCase() === "activa"
                    ? "ACTIVA"
                    : "ATENDIDA"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#F9FAFB] rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={cerrarDetalle}
            className="px-4 py-2 rounded-full bg-slate-600 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            Volver
          </button>

          {alerta.estatus === "activa" && (
            <button
              onClick={handleAtender}
              className="px-4 py-2 rounded-full bg-[#10B981] text-white text-sm font-semibold hover:bg-[#059669] transition-colors"
            >
              Atender Alerta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
