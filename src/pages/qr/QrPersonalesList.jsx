// pages/qr/QRPersonalList.jsx - VERSIÓN SIMPLIFICADA
import { useContext, useEffect, useMemo, useState } from "react";
import QRContext from "@/context/QR/QRContext";

export default function QRPersonalList() {
  const {
    qrPersonales,
    loading,
    error,
    getQRPersonales,
    generarQR,
    actualizarEstadoQR,
    getQRImage,
    descargarQR,
    clearError,
  } = useContext(QRContext);

  const [filtros, setFiltros] = useState({
    search: "",
    estado: "todos",
  });

  const [loadingActions, setLoadingActions] = useState({});

  useEffect(() => {
    getQRPersonales();
  }, []);

  const filteredRows = useMemo(() => {
    return qrPersonales.filter((row) => {
      const { usuario, qr } = row;
      if (!usuario) return false;

      const fullName = [
        usuario.nombre,
        usuario.apellidoPaterno,
        usuario.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch =
        !filtros.search ||
        fullName.includes(filtros.search.toLowerCase()) ||
        (qr?.codigoQR || "").toLowerCase().includes(filtros.search.toLowerCase());

      const matchEstado =
        filtros.estado === "todos"
          ? true
          : filtros.estado === "activos"
          ? qr?.activo === true
          : qr?.activo === false;

      return matchSearch && matchEstado;
    });
  }, [qrPersonales, filtros]);

  const handleToggleEstado = async (row) => {
    if (!row.qr) return;
    
    setLoadingActions(prev => ({ ...prev, [row.usuario.usuarioID]: 'estado' }));
    
    try {
      await actualizarEstadoQR(row.qr.qrid, !row.qr.activo);
      // 🔥 Recargar lista después de cambiar estado
      await getQRPersonales();
    } finally {
      setLoadingActions(prev => ({ ...prev, [row.usuario.usuarioID]: null }));
    }
  };

  const handleRegenerar = async (row) => {
    setLoadingActions(prev => ({ ...prev, [row.usuario.usuarioID]: 'regenerar' }));
    
    try {
      await generarQR(row.usuario.usuarioID);
      // La recarga ya está en la función generarQR del context
    } finally {
      setLoadingActions(prev => ({ ...prev, [row.usuario.usuarioID]: null }));
    }
  };

  const handleDescargarQR = (row) => {
    if (!row.qr?.codigoQR) return;
    const nombre = `${row.usuario.nombre || 'usuario'}_${row.usuario.apellidoPaterno || ''}`.replace(/\s+/g, '_');
    descargarQR(row.qr.codigoQR, `qr_${nombre}`);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
  };

  const getFullName = (usuario) => {
    if (!usuario) return "Usuario no disponible";
    
    const fullName = [
      usuario.nombre,
      usuario.apellidoPaterno,
      usuario.apellidoMaterno,
    ]
      .filter(Boolean)
      .join(" ");
    
    return fullName || `Usuario #${usuario.usuarioID}`;
  };

  return (
    <div className="px-4 md:px-8 pb-10">
      {/* Header y Banner */}
      <header className="pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Administración de QR personales
        </h1>
        <p className="mt-1 text-slate-500 max-w-3xl">
          Desde aquí puedes revisar, generar y cambiar el estado de los códigos QR personales.
        </p>
      </header>

      <section className="mb-6">
        <div className="bg-emerald-600 text-white rounded-3xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-xl font-bold">QR personales de acceso</h2>
            <p className="text-emerald-100 text-sm md:text-base">
              Consulta el estado de los QR y regenera códigos.
            </p>
          </div>
          <button
            onClick={getQRPersonales}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/30 text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <span className="text-lg">⟳</span>
            <span>{loading ? "Cargando..." : "Recargar"}</span>
          </button>
        </div>
      </section>

      {/* Filtros */}
      <section className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre de usuario..."
            className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={filtros.search}
            onChange={(e) => setFiltros(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="rounded-full border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={filtros.estado}
            onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>
        </div>
      </section>

      {/* Tabla SIMPLIFICADA - SOLO IMAGEN QR */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-emerald-700 text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-3 flex items-center">
          <div className="w-1/4 text-center">Usuario</div>
          <div className="w-1/4 text-center">QR</div>
          <div className="w-1/5 text-center">Vigencia</div>
          <div className="w-1/12 text-center">Estado</div>
          <div className="flex-1 text-center pr-2">Acciones</div>
        </div>

        {loading && qrPersonales.length === 0 ? (
          <div className="px-4 md:px-6 py-8 text-sm text-slate-500 text-center">
            Cargando usuarios y QR...
          </div>
        ) : error ? (
          <div className="px-4 md:px-6 py-6 text-sm text-red-600 text-center">
            {error}
            <button onClick={clearError} className="ml-2 text-red-400 hover:text-red-300">✕</button>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="px-4 md:px-6 py-8 text-sm text-slate-500 text-center">
            No se encontraron usuarios con los filtros seleccionados.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredRows.map((row) => {
              const { usuario, qr } = row;
              const fullName = getFullName(usuario);
              const isRowLoading = loadingActions[usuario.usuarioID];

              return (
                <li key={usuario.usuarioID} className="px-4 md:px-6 py-4 text-xs md:text-sm hover:bg-emerald-50/70 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Usuario */}
                    <div className="w-1/4 min-w-[140px] text-center">
                      <div className="font-medium text-slate-800">{fullName}</div>
                      <div className="text-[11px] text-slate-500 mt-1">ID: {usuario.usuarioID}</div>
                    </div>

                    {/* 🔥 SOLO IMAGEN QR - SIN CÓDIGO */}
                    <div className="w-1/4 min-w-[100px] flex justify-center">
                      {qr?.codigoQR ? (
                        <div className="flex flex-col items-center gap-2">
                          <img 
                            src={getQRImage(qr.codigoQR, 80)} 
                            alt={`QR ${usuario.nombre}`}
                            className="w-16 h-16 border border-slate-200 rounded-lg"
                          />
                          <button
                            onClick={() => handleDescargarQR(row)}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Descargar QR
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 border border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                            <span className="text-[10px] text-slate-400">Sin QR</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vigencia */}
                    <div className="w-1/5 min-w-[140px] text-center">
                      {qr ? (
                        <div className="text-[11px] text-slate-600 space-y-1">
                          <div className="flex flex-col">
                            <span className="font-semibold">Generado:</span>
                            <span>{formatDate(qr.fechaGeneracion)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold">Vence:</span>
                            <span>{formatDate(qr.fechaVencimiento)}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </div>

                    {/* Estado */}
                    <div className="w-1/12 min-w-[80px] flex justify-center">
                      {qr ? (
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          qr.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                        }`}>
                          {qr.activo ? "Activo" : "Inactivo"}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex-1 flex justify-center gap-2">
                      <button
                        onClick={() => handleRegenerar(row)}
                        disabled={isRowLoading}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] md:text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 min-w-[100px] justify-center"
                      >
                        {isRowLoading === 'regenerar' ? (
                          <>⟳ Generando...</>
                        ) : qr ? (
                          "Regenerar QR"
                        ) : (
                          "Generar QR"
                        )}
                      </button>

                      {qr && (
                        <button
                          onClick={() => handleToggleEstado(row)}
                          disabled={isRowLoading}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] md:text-xs font-semibold min-w-[90px] justify-center ${
                            qr.activo
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : "bg-slate-500 hover:bg-slate-600 text-white"
                          } disabled:opacity-50`}
                        >
                          {isRowLoading === 'estado' ? (
                            "⟳"
                          ) : qr.activo ? (
                            "Desactivar"
                          ) : (
                            "Activar"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}