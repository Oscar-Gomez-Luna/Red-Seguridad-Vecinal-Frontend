import { useEffect, useMemo, useState, useContext } from "react";
import PagosContext from "@/context/Pagos/PagosContext";
import ModalCargoMantenimiento from "./ModalCargoMantenimiento";

const fmtMoney = (n) =>
  typeof n === "number"
    ? n.toLocaleString("es-MX", { style: "currency", currency: "MXN" })
    : n;

const fmtDate = (d) => {
  if (!d) return "-";
  try {
    const x = new Date(d);
    if (isNaN(x.getTime())) return "-";
    return x.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "-";
  }
};

const EstadoPill = ({ estado }) => {
  const getColorClasses = () => {
    switch (estado) {
      case "Pendiente":
        return "bg-amber-50 text-amber-700 ring-amber-200";
      case "Pagado":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      case "Vencido":
        return "bg-red-50 text-red-700 ring-red-200";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${getColorClasses()}`}
    >
      {estado}
    </span>
  );
};

const MetodoPagoPill = ({ metodo }) => {
  const getColorClasses = () => {
    switch (metodo) {
      case "Tarjeta":
        return "bg-purple-50 text-purple-700 ring-purple-200";
      case "Efectivo":
        return "bg-green-50 text-green-700 ring-green-200";
      case "Transferencia":
        return "bg-blue-50 text-blue-700 ring-blue-200";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${getColorClasses()}`}
    >
      {metodo || "No especificado"}
    </span>
  );
};

export default function CargosMantenimiento() {
  const { getAllCargosMantenimiento, obtenerTodosLosPagos } =
    useContext(PagosContext);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Pendiente");
  const [tipoVista, setTipoVista] = useState("cargos");

  // Estados para el pago
  const [cargosSeleccionados, setCargosSeleccionados] = useState({});
  const [montosPago, setMontosPago] = useState({});
  const [procesandoPago, setProcesandoPago] = useState(false);

  // Estados para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargoEditando, setCargoEditando] = useState(null);

  const mostrarColumnasPagos = tipoVista === "pagos";

  const descargarComprobante = async (pagoId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/Pagos/comprobante/${pagoId}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        alert("No se pudo abrir el comprobante");
      }
    } catch (error) {
      console.error("Error al abrir comprobante:", error);
      alert("Error al abrir el comprobante");
    }
  };

  const loadAll = async () => {
    try {
      setErr("");
      setLoading(true);

      if (tipoVista === "cargos") {
        const cargos = await getAllCargosMantenimiento();

        // DEBUG: Verificar estructura de datos
        console.log("Cargos crudos del API:", cargos);

        if (cargos.length > 0) {
          console.log("Primer cargo crudo:", cargos[0]);
          console.log("Campos disponibles:", Object.keys(cargos[0]));
        }

        // Usar la estructura EXACTA del primer código
        const formateados = cargos.map((c) => {
          const usuarioId = c.usuarioID || c.usuarioId;
          console.log(
            `Cargo ${c.cargoMantenimientoID}: usuarioID=${c.usuarioID}, usuarioId=${c.usuarioId}, usuarioId final=${usuarioId}`
          );

          return {
            ...c,
            usuarioNombre:
              [
                c.usuarioNombre || c.nombreUsuario,
                c.usuarioApellidoP || c.apellidoPaterno,
                c.usuarioApellidoM || c.apellidoMaterno,
              ]
                .filter(Boolean)
                .join(" ") || `Usuario #${usuarioId}`,
            usuarioID: usuarioId, // Asegurar que siempre haya usuarioID
            tipo: "cargo",
            monto: parseFloat(c.monto) || 0,
            montoPagado: parseFloat(c.montoPagado) || 0,
            saldoPendiente:
              (parseFloat(c.monto) || 0) - (parseFloat(c.montoPagado) || 0),
            estado: c.estado || "Pendiente",
            fechaCreacion: c.fechaCreacion,
            fechaVencimiento: c.fechaVencimiento,
            cargoMantenimientoID: c.cargoMantenimientoID,
            concepto: c.concepto,
            notas: c.notas || "",
          };
        });

        console.log("Cargos formateados:", formateados);
        setRows(formateados);
      } else {
        const pagos = await obtenerTodosLosPagos();

        const pagosMantenimiento = pagos.filter(
          (pago) =>
            pago.detallesPago &&
            pago.detallesPago.some(
              (detalle) => detalle.cargoMantenimientoID !== null
            )
        );

        const formateados = pagosMantenimiento.map((p) => {
          const detalleMantenimiento = p.detallesPago.find(
            (d) => d.cargoMantenimientoID !== null
          );

          return {
            ...p,
            usuarioNombre: [
              p.usuario?.persona?.nombre,
              p.usuario?.persona?.apellidoPaterno,
              p.usuario?.persona?.apellidoMaterno,
            ]
              .filter(Boolean)
              .join(" "),
            usuarioID: p.usuario?.usuarioID,
            tipo: "pago",
            concepto: `Pago Mantenimiento - ${p.folioUnico}`,
            monto: p.montoTotal,
            montoPagado: p.montoTotal,
            saldoPendiente: 0,
            estado: "Completado",
            fechaCreacion: p.fechaPago,
            fechaVencimiento: null,
            metodoPago: p.metodoPago,
            tipoPago: p.tipoPago,
            folioUnico: p.folioUnico,
            tieneComprobante: !!p.comprobante,
            cargoMantenimientoID: detalleMantenimiento?.cargoMantenimientoID,
          };
        });

        setRows(formateados);
      }
    } catch (e) {
      console.error("Error cargando datos:", e);
      setErr("No se pudieron cargar los datos.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    setCargosSeleccionados({});
    setMontosPago({});
  }, [tipoVista]);

  const dataFiltrada = useMemo(() => {
    let list = rows;

    if (!mostrarColumnasPagos && filtroEstado !== "Todos") {
      list = list.filter((r) => r.estado === filtroEstado);
    }

    if (filtroNombre.trim()) {
      const q = filtroNombre.trim().toLowerCase();
      list = list.filter((r) => r.usuarioNombre?.toLowerCase().includes(q));
    }

    return list;
  }, [rows, filtroEstado, filtroNombre, mostrarColumnasPagos]);

  // Filtrar solo cargos pendientes para pago
  const cargosPendientes = useMemo(() => {
    return dataFiltrada.filter(
      (r) => r.tipo === "cargo" && r.estado === "Pendiente"
    );
  }, [dataFiltrada]);

  // Calcular totales
  const totales = useMemo(() => {
    const ids = Object.keys(cargosSeleccionados).filter(
      (id) => cargosSeleccionados[id]
    );
    const totalCargos = ids.reduce((sum, id) => {
      const cargo = cargosPendientes.find(
        (c) => c.cargoMantenimientoID === parseInt(id)
      );
      return sum + (cargo?.saldoPendiente || 0);
    }, 0);
    const totalPagar = ids.reduce((sum, id) => {
      return sum + (parseFloat(montosPago[id]) || 0);
    }, 0);
    return { totalCargos, totalPagar, cantidadSeleccionados: ids.length };
  }, [cargosSeleccionados, montosPago, cargosPendientes]);

  const handleCheckboxChange = (cargoId, checked) => {
    setCargosSeleccionados((prev) => ({
      ...prev,
      [cargoId]: checked,
    }));

    // Inicializar monto con el saldo pendiente
    if (checked) {
      const cargo = cargosPendientes.find(
        (c) => c.cargoMantenimientoID === cargoId
      );
      if (cargo) {
        setMontosPago((prev) => ({
          ...prev,
          [cargoId]: cargo.saldoPendiente.toFixed(2),
        }));
      }
    } else {
      // Limpiar monto si se desmarca
      setMontosPago((prev) => {
        const newMontos = { ...prev };
        delete newMontos[cargoId];
        return newMontos;
      });
    }
  };

  const handleMontoChange = (cargoId, value) => {
    setMontosPago((prev) => ({
      ...prev,
      [cargoId]: value,
    }));
  };

  const validarMontos = () => {
    const errors = [];
    const ids = Object.keys(cargosSeleccionados).filter(
      (id) => cargosSeleccionados[id]
    );

    for (const id of ids) {
      const monto = parseFloat(montosPago[id]);
      const cargo = cargosPendientes.find(
        (c) => c.cargoMantenimientoID === parseInt(id)
      );

      if (!cargo) continue;

      if (isNaN(monto) || monto <= 0) {
        errors.push(`El cargo #${id} debe tener un monto válido mayor a 0`);
      } else if (monto > cargo.saldoPendiente) {
        errors.push(
          `El cargo #${id} no puede tener un monto mayor a ${fmtMoney(
            cargo.saldoPendiente
          )}`
        );
      }
    }

    return errors;
  };

  const procesarPago = async () => {
    // Validar que hay cargos seleccionados
    const idsSeleccionados = Object.keys(cargosSeleccionados).filter(
      (id) => cargosSeleccionados[id]
    );

    if (idsSeleccionados.length === 0) {
      alert("Debe seleccionar al menos un cargo para pagar");
      return;
    }

    // Validar montos
    const erroresValidacion = validarMontos();
    if (erroresValidacion.length > 0) {
      alert("Errores de validación:\n\n" + erroresValidacion.join("\n"));
      return;
    }

    // Obtener el usuarioID del primer cargo seleccionado
    const primerCargo = cargosPendientes.find(
      (c) => c.cargoMantenimientoID === parseInt(idsSeleccionados[0])
    );

    console.log("Primer cargo para pago:", primerCargo);
    console.log("usuarioID:", primerCargo?.usuarioID);
    console.log("usuarioId:", primerCargo?.usuarioId);

    if (!primerCargo) {
      alert("Error al obtener información del cargo");
      return;
    }

    if (!primerCargo.usuarioID && primerCargo.usuarioID !== 0) {
      alert(
        "El cargo seleccionado no tiene un usuario asignado. No se puede procesar el pago."
      );
      return;
    }

    // Construir detallesPagoJson - EXACTO como en el primer código
    const detalles = idsSeleccionados.map((id) => ({
      CargoMantenimientoID: parseInt(id),
      MontoAplicado: parseFloat(montosPago[id]),
    }));

    // Payload EXACTO como en el primer código
    const payload = {
      usuarioID: primerCargo.usuarioID, // Asegurar que sea usuarioID
      montoTotal: totales.totalPagar,
      tipoPago: "Mantenimiento",
      metodoPago: "Efectivo",
      detallesPagoJson: JSON.stringify(detalles),
    };

    console.log("Payload a enviar:", payload);
    console.log("detallesPagoJson:", payload.detallesPagoJson);

    try {
      setProcesandoPago(true);
      setErr("");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/Pagos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error("Error data:", errorData);
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch (e) {
          // No se pudo parsear como JSON
          const text = await response.text();
          console.error("Error text:", text);
        }
        throw new Error(errorMessage);
      }

      // Obtener el blob del comprobante
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Abrir en nueva ventana
      window.open(url, "_blank");

      // Limpiar selección
      setCargosSeleccionados({});
      setMontosPago({});

      // Recargar datos
      await loadAll();

      alert("Pago procesado exitosamente");
    } catch (error) {
      console.error("Error al procesar pago:", error);
      setErr(`Error al procesar el pago: ${error.message}`);
      alert(`Error al procesar el pago: ${error.message}`);
    } finally {
      setProcesandoPago(false);
    }
  };

  const abrirModalCrear = () => {
    setCargoEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (cargo) => {
    console.log("Cargando datos para editar:", cargo);
    setCargoEditando({
      cargoMantenimientoID: cargo.cargoMantenimientoID,
      usuarioID: cargo.usuarioID, // Usar usuarioID
      personalMantenimientoID: cargo.personalMantenimientoID,
      concepto: cargo.concepto,
      monto: cargo.monto,
      fechaVencimiento: cargo.fechaVencimiento,
      notas: cargo.notas || "",
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCargoEditando(null);
  };

  const handleCargoGuardado = () => {
    loadAll();
  };

  return (
    <>
      <div className="p-4 md:p-6">
        {/* Header con botón de crear */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              {mostrarColumnasPagos
                ? "Historial de Pagos de Mantenimiento"
                : "Cargos de Mantenimiento"}
            </h1>
            <p className="text-slate-500">
              {mostrarColumnasPagos
                ? "Todos los pagos de mantenimiento registrados"
                : "Gestión de cargos de mantenimiento del sistema"}
            </p>
          </div>

          {!mostrarColumnasPagos && (
            <button
              onClick={abrirModalCrear}
              className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nuevo Cargo
            </button>
          )}
        </div>

        {/* Selector de Vista */}
        <div className="mb-6">
          <label className="text-sm text-slate-600 font-medium">
            Tipo de Vista
          </label>
          <select
            className="w-full md:w-64 rounded-lg border px-3 py-2 mt-1"
            value={tipoVista}
            onChange={(e) => setTipoVista(e.target.value)}
          >
            <option value="cargos">Cargos Pendientes</option>
            <option value="pagos">Todos los Pagos</option>
          </select>
        </div>

        {/* Panel de búsqueda */}
        <div className="rounded-2xl border border-slate-200 shadow mb-5 overflow-hidden">
          <div className="px-4 py-2 bg-emerald-700 text-white font-semibold">
            Búsqueda
          </div>

          <div
            className={`p-4 bg-white grid ${
              mostrarColumnasPagos
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-3"
            } gap-4`}
          >
            <div>
              <label className="text-sm text-slate-600">
                Buscar por nombre
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Ej. Oscar, López..."
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
              />
            </div>

            {!mostrarColumnasPagos && (
              <div>
                <label className="text-sm text-slate-600">Estado</label>
                <select
                  className="w-full rounded-lg border px-3 py-2"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                  <option value="Todos">Todos</option>
                </select>
              </div>
            )}

            <div className="flex items-end">
              <button
                onClick={loadAll}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-2 rounded-lg transition-colors"
              >
                {loading ? "Cargando..." : "Actualizar"}
              </button>
            </div>
          </div>

          {err && <p className="text-red-600 px-4 pb-3">{err}</p>}
        </div>

        {/* Panel de pago */}
        {!mostrarColumnasPagos && totales.cantidadSeleccionados > 0 && (
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 mb-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-emerald-900 mb-1">
                  Resumen de Pago
                </h3>
                <div className="text-sm text-emerald-700 space-y-1">
                  <p>Cargos seleccionados: {totales.cantidadSeleccionados}</p>
                  <p>Total en cargos: {fmtMoney(totales.totalCargos)}</p>
                  <p className="font-semibold">
                    Total a pagar: {fmtMoney(totales.totalPagar)}
                  </p>
                </div>
              </div>
              <button
                onClick={procesarPago}
                disabled={procesandoPago}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {procesandoPago ? "Procesando..." : "Procesar Pago"}
              </button>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="rounded-xl border shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white">
              <thead className="bg-emerald-700 text-white">
                <tr>
                  {!mostrarColumnasPagos && filtroEstado === "Pendiente" && (
                    <th className="px-4 py-3 text-left">Pagar</th>
                  )}
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Concepto</th>
                  <th className="px-4 py-3 text-left">Monto</th>
                  {!mostrarColumnasPagos && (
                    <th className="px-4 py-3 text-left">Pagado</th>
                  )}
                  <th className="px-4 py-3 text-left">Estado</th>
                  {mostrarColumnasPagos && (
                    <>
                      <th className="px-4 py-3 text-left">Método Pago</th>
                      <th className="px-4 py-3 text-left">Folio</th>
                      <th className="px-4 py-3 text-left">Comprobante</th>
                    </>
                  )}
                  {!mostrarColumnasPagos && (
                    <th className="px-4 py-3 text-left">Pendiente</th>
                  )}
                  {!mostrarColumnasPagos && filtroEstado === "Pendiente" && (
                    <th className="px-4 py-3 text-left">Monto a Pagar</th>
                  )}
                  {!mostrarColumnasPagos && (
                    <th className="px-4 py-3 text-left">Vence</th>
                  )}
                  <th className="px-4 py-3 text-left">
                    {mostrarColumnasPagos ? "Fecha Pago" : "Creado"}
                  </th>
                </tr>
              </thead>

              <tbody>
                {dataFiltrada.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        !mostrarColumnasPagos
                          ? filtroEstado === "Pendiente"
                            ? 12
                            : 11
                          : 9
                      }
                      className="text-center py-6 text-slate-500"
                    >
                      {loading ? "Cargando..." : "Sin resultados"}
                    </td>
                  </tr>
                ) : (
                  dataFiltrada.map((r) => {
                    const esPendiente =
                      r.estado === "Pendiente" && r.tipo === "cargo";
                    const estaSeleccionado =
                      cargosSeleccionados[r.cargoMantenimientoID];

                    return (
                      <tr
                        key={
                          r.tipo === "pago"
                            ? `pago-${r.pagoID}`
                            : `cargo-${r.cargoMantenimientoID}`
                        }
                        className={`border-t hover:bg-slate-50 ${
                          estaSeleccionado ? "bg-emerald-50" : ""
                        }`}
                      >
                        {!mostrarColumnasPagos &&
                          filtroEstado === "Pendiente" && (
                            <td className="px-4 py-3">
                              {esPendiente && (
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-emerald-600 rounded"
                                  checked={estaSeleccionado || false}
                                  onChange={(e) =>
                                    handleCheckboxChange(
                                      r.cargoMantenimientoID,
                                      e.target.checked
                                    )
                                  }
                                />
                              )}
                            </td>
                          )}

                        <td className="px-4 py-3">
                          <div className="font-medium">{r.usuarioNombre}</div>
                          <div className="text-xs text-slate-500">
                            ID: {r.usuarioID || "N/A"}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {r.tipo === "pago"
                            ? r.pagoID
                            : r.cargoMantenimientoID}
                        </td>

                        <td className="px-4 py-3">{r.concepto}</td>

                        <td className="px-4 py-3 font-medium">
                          {fmtMoney(r.monto)}
                        </td>

                        {!mostrarColumnasPagos && (
                          <td className="px-4 py-3">
                            {r.montoPagado != null
                              ? fmtMoney(r.montoPagado)
                              : "-"}
                          </td>
                        )}

                        <td className="px-4 py-3">
                          <EstadoPill estado={r.estado} />
                        </td>

                        {mostrarColumnasPagos && (
                          <>
                            <td className="px-4 py-3">
                              <MetodoPagoPill metodo={r.metodoPago} />
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-slate-600">
                              {r.folioUnico}
                            </td>
                            <td className="px-4 py-3">
                              {r.tieneComprobante ? (
                                <button
                                  onClick={() => descargarComprobante(r.pagoID)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Comprobante
                                </button>
                              ) : (
                                <span className="text-slate-400 text-xs">
                                  No disponible
                                </span>
                              )}
                            </td>
                          </>
                        )}

                        {!mostrarColumnasPagos && (
                          <td className="px-4 py-3">
                            {fmtMoney(r.saldoPendiente)}
                          </td>
                        )}

                        {!mostrarColumnasPagos &&
                          filtroEstado === "Pendiente" && (
                            <td className="px-4 py-3">
                              {esPendiente && estaSeleccionado ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={r.saldoPendiente}
                                  className="w-28 rounded border px-2 py-1 text-sm"
                                  value={
                                    montosPago[r.cargoMantenimientoID] || ""
                                  }
                                  onChange={(e) =>
                                    handleMontoChange(
                                      r.cargoMantenimientoID,
                                      e.target.value
                                    )
                                  }
                                  placeholder="0.00"
                                />
                              ) : (
                                "-"
                              )}
                            </td>
                          )}

                        {!mostrarColumnasPagos && (
                          <td className="px-4 py-3">
                            {fmtDate(r.fechaVencimiento)}
                          </td>
                        )}

                        <td className="px-4 py-3">
                          {fmtDate(r.fechaCreacion)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar cargos */}
      <ModalCargoMantenimiento
        isOpen={modalAbierto}
        onClose={cerrarModal}
        cargoExistente={cargoEditando}
        onSuccess={handleCargoGuardado}
      />
    </>
  );
}
