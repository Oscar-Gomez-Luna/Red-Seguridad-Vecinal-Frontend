import { useContext, useEffect, useMemo, useState } from "react";
import InvitadosContext from "@/context/Invitados/InvitadosContext";
import Swal from "sweetalert2";

export default function InvitadosList() {
  const {
    invitaciones,
    loading,
    error,
    ultimoAcceso,
    scannerActive,
    getInvitaciones,
    cancelarInvitacion,
    procesarQRCode,
    generarQRImage,
    descargarQR,
    setScannerActive,
    clearError,
  } = useContext(InvitadosContext);

  const [search, setSearch] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    getInvitaciones();
  }, []);

  useEffect(() => {
    if (ultimoAcceso) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [ultimoAcceso]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invitaciones;

    return invitaciones.filter((inv) => {
      const fullName =
        `${inv.nombreInvitado} ${inv.apellidoPaternoInvitado} ${inv.apellidoMaternoInvitado}`.toLowerCase();
      const residente = (inv.nombreResidente || "").toLowerCase();
      const casa = (inv.numeroCasa || "").toLowerCase();
      const codigo = (inv.codigoQR || "").toLowerCase();
      const estado = (inv.estado || "").toLowerCase();

      return (
        fullName.includes(q) ||
        residente.includes(q) ||
        casa.includes(q) ||
        codigo.includes(q) ||
        estado.includes(q)
      );
    });
  }, [search, invitaciones]);

  // 🔵 Reemplaza prompt() con SweetAlert2
  const simularLecturaQR = async () => {
    const { value: qrCode } = await Swal.fire({
      title: "Lectura manual",
      input: "text",
      inputLabel: "Ingresa el código QR",
      inputPlaceholder: "Ejemplo: ABC123XY",
      showCancelButton: true,
      confirmButtonText: "Procesar",
      cancelButtonText: "Cancelar",
    });

    if (qrCode && qrCode.trim()) {
      procesarQRCode(qrCode.trim());
    }
  };

  // 🔵 Reemplaza alert() con SweetAlert2
  const iniciarEscaneoReal = async () => {
    setScannerActive(true);

    await Swal.fire({
      icon: "info",
      title: "Configura Barcode to PC",
      html: `
        Para iniciar el escaneo, configura y escanea el código:<br><br>
        También puedes usar "Lectura Manual".
      `,
      confirmButtonText: "Entendido",
    });
  };

  const handleCancelar = async (id) => {
    const result = await Swal.fire({
      title: "¿Cancelar invitación?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      await cancelarInvitacion(id);
      Swal.fire("Cancelada", "La invitación ha sido cancelada.", "success");
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return value.substring(0, 10);
  };

  const getEstadoStyles = (estado) => {
    const base =
      "inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold";
    switch (estado) {
      case "Activo":
        return `${base} bg-emerald-100 text-emerald-700`;
      case "Pendiente":
        return `${base} bg-amber-100 text-amber-700`;
      case "Cancelado":
        return `${base} bg-red-100 text-red-700`;
      case "Expirado":
        return `${base} bg-slate-200 text-slate-700`;
      default:
        return `${base} bg-slate-100 text-slate-600`;
    }
  };

  return (
    <div className="px-4 md:px-8 pb-10">
      <header className="pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Gestión de Invitados
        </h1>
        <p className="mt-1 text-slate-500 max-w-3xl">
          Administra y controla el acceso de invitados al fraccionamiento.
        </p>
      </header>

      <section className="mb-6">
        <div className="bg-emerald-600 text-white rounded-3xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-xl font-bold">Control de Accesos</h2>
            <p className="text-emerald-100 text-sm md:text-base">
              Escanea códigos QR para registrar entradas y salidas de invitados.
            </p>
          </div>
          <button
            onClick={getInvitaciones}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/30 text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <span className="text-lg">⟳</span>
            <span>{loading ? "Cargando..." : "Recargar"}</span>
          </button>
        </div>
      </section>

      <section className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por invitado, residente, casa o código..."
            className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={iniciarEscaneoReal}
            disabled={scannerActive}
            className="inline-flex items-center px-4 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {scannerActive ? "Escaneando..." : "Activar Escáner"}
          </button>
          <button
            onClick={simularLecturaQR}
            className="inline-flex items-center px-4 py-2.5 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
          >
            Lectura Manual
          </button>
        </div>
      </section>

      {scannerActive && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-800">
              Escáner activo - Esperando código QR...
            </span>
          </div>
        </div>
      )}

      {showNotification && ultimoAcceso && (
        <div
          className={`mb-4 p-4 rounded-2xl border ${
            ultimoAcceso.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-lg ${
                ultimoAcceso.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {ultimoAcceso.success ? "✅" : "❌"}
            </span>
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  ultimoAcceso.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {ultimoAcceso.success ? "Acceso procesado" : "Error de acceso"}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {ultimoAcceso.success
                  ? `Código: ${ultimoAcceso.qrCode}`
                  : ultimoAcceso.error}
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-emerald-700 text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-3 flex items-center">
          <div className="w-1/6 text-center">QR</div>
          <div className="w-1/5 text-center">Invitado</div>
          <div className="w-1/6 text-center">Residente</div>
          <div className="w-1/6 text-center">Casa</div>
          <div className="w-1/6 text-center">Vigencia</div>
          <div className="w-1/12 text-center">Estado</div>
          <div className="flex-1 text-center">Acciones</div>
        </div>

        {loading && invitaciones.length === 0 ? (
          <div className="px-4 md:px-6 py-8 text-sm text-slate-500 text-center">
            Cargando invitaciones...
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
        ) : filteredRows.length === 0 ? (
          <div className="px-4 md:px-6 py-8 text-sm text-slate-500 text-center">
            No se encontraron invitaciones con los filtros seleccionados.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredRows.map((inv) => (
              <li
                key={inv.invitadoID}
                className="px-4 md:px-6 py-4 text-xs md:text-sm hover:bg-emerald-50/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-1/6 flex justify-center">
                    {inv.codigoQR ? (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={generarQRImage(inv.codigoQR, 60)}
                          alt={`QR ${inv.codigoQR}`}
                          className="w-12 h-12 border border-slate-200 rounded-lg"
                        />
                        <button
                          onClick={() =>
                            descargarQR(
                              inv.codigoQR,
                              `invitado_${inv.nombreInvitado}`
                            )
                          }
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Descargar
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 border border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                        <span className="text-[10px] text-slate-400">
                          Sin QR
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-1/5 text-center">
                    <div className="font-medium text-slate-800">
                      {inv.nombreInvitado} {inv.apellidoPaternoInvitado}
                    </div>
                    {inv.apellidoMaternoInvitado && (
                      <div className="text-[11px] text-slate-500">
                        {inv.apellidoMaternoInvitado}
                      </div>
                    )}
                  </div>

                  <div className="w-1/6 text-center text-slate-700">
                    {inv.nombreResidente || "-"}
                  </div>

                  <div className="w-1/6 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      {inv.numeroCasa || "-"}
                    </span>
                  </div>

                  <div className="w-1/6 text-center text-[11px] text-slate-600 space-y-1">
                    <div className="flex flex-col">
                      <span className="font-semibold">Generado:</span>
                      <span>{formatDate(inv.fechaGeneracion)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">Vence:</span>
                      <span>{formatDate(inv.fechaVencimiento)}</span>
                    </div>
                  </div>

                  <div className="w-1/12 flex justify-center">
                    <span className={getEstadoStyles(inv.estado)}>
                      {inv.estado}
                    </span>
                  </div>

                  <div className="flex-1 flex justify-center">
                    <button
                      onClick={() => handleCancelar(inv.invitadoID)}
                      disabled={
                        inv.estado === "Cancelado" || inv.estado === "Expirado"
                      }
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-600 text-white text-[11px] font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
