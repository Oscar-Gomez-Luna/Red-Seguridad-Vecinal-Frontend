// src/pages/servicios/EstadoSolicitudPill.jsx

function getEstadoCls(estado) {
  const e = (estado || "").toLowerCase();

  if (e === "completado" || e === "completada") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (e === "en proceso") {
    return "bg-sky-50 text-sky-700";
  }
  if (e === "cancelada" || e === "cancelado") {
    return "bg-slate-100 text-slate-600";
  }
  return "bg-amber-50 text-amber-700";
}

export default function EstadoSolicitudPill({ estado }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getEstadoCls(
        estado
      )}`}
    >
      {estado || "Pendiente"}
    </span>
  );
}
