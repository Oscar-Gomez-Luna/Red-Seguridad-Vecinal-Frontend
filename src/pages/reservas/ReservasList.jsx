// src/pages/reservas/ReservasList.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import ReservasContext from "../../context/Reservas/ReservasContext";
import { useAmenidades } from "../../context/Amenidades/AmenidadesContext";
import ReservaForm from "./ReservaForm";
import Swal from "sweetalert2";

export default function ReservasList() {
  const {
    reservas,
    loading,
    error,
    fetchReservas,
    crearReserva,
    cancelarReserva,
    actualizarEstadoReserva,
  } = useContext(ReservasContext);

  const { amenidades, cargarAmenidades } = useAmenidades();

  const [busqueda, setBusqueda] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  // Cargar reservas y amenidades
  useEffect(() => {
    const load = async () => {
      try {
        setLocalError("");
        await Promise.all([fetchReservas(), cargarAmenidades()]);
      } catch (err) {
        console.error("Error al cargar reservas:", err);
        await Swal.fire({
          title: "Error de carga",
          text: "No se pudieron cargar las reservas. Por favor, recarga la página.",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    };
    load();
  }, [fetchReservas, cargarAmenidades]);

  const errorFinal = localError || error;

  const handleNueva = () => {
    setOpenForm(true);
  };

  const handleCerrarForm = () => {
    setOpenForm(false);
  };

  const handleSubmitForm = async (values) => {
    try {
      setSaving(true);
      setLocalError("");

      // Mostrar confirmación antes de crear
      const result = await Swal.fire({
        title: "¿Crear nueva reserva?",
        html: `
          <div class="text-left space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-semibold">Amenidad:</span>
              <span>${values.amenidadNombre || "Seleccionar"}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-semibold">Usuario:</span>
              <span>${values.nombreUsuario}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-semibold">Casa:</span>
              <span>${values.numeroCasa}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-semibold">Fecha:</span>
              <span>${values.fechaReserva}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-semibold">Horario:</span>
              <span>${values.horaInicio} - ${values.horaFin}</span>
            </div>
            <div>
              <span class="font-semibold">Motivo:</span>
              <p class="text-sm bg-slate-50 p-2 rounded mt-1">${
                values.motivo
              }</p>
            </div>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, crear",
        cancelButtonText: "Cancelar",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            await crearReserva(values);
          } catch (error) {
            Swal.showValidationMessage(
              `Error: ${
                error?.response?.data?.message ||
                error.message ||
                "No se pudo crear la reserva"
              }`
            );
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

      if (result.isConfirmed) {
        await Swal.fire({
          title: "¡Reserva creada!",
          text: "La reserva se ha creado exitosamente.",
          icon: "success",
          confirmButtonColor: "#10b981",
        });
        setOpenForm(false);
      }
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al guardar la reserva.";
      setLocalError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = async (reserva) => {
    const result = await Swal.fire({
      title: "¿Cancelar reserva?",
      html: `
        <div class="text-left space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold">Amenidad:</span>
            <span>${reserva.amenidadNombre}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Usuario:</span>
            <span>${reserva.nombreUsuario}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Casa:</span>
            <span>${reserva.numeroCasa}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Fecha:</span>
            <span>${String(reserva.fechaReserva).slice(0, 10)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Estado actual:</span>
            <span>${reserva.estado}</span>
          </div>
          <p class="mt-3 text-rose-600 text-sm font-medium">
            Esta acción no se puede deshacer. La reserva será cancelada permanentemente.
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, conservar",
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await cancelarReserva(reserva.reservaID);
        } catch (error) {
          Swal.showValidationMessage(
            `Error: ${
              error?.response?.data?.message ||
              error.message ||
              "No se pudo cancelar la reserva"
            }`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: "¡Reserva cancelada!",
        text: "La reserva ha sido cancelada exitosamente.",
        icon: "success",
        confirmButtonColor: "#10b981",
      });
    }
  };

  const handleEstado = async (reserva, nuevoEstado) => {
    const estadoConfig = {
      Aprobada: {
        color: "#10b981",
        icon: "success",
        title: "Aprobar reserva",
        confirmText: "Aprobar",
        confirmColor: "#10b981",
      },
      Rechazada: {
        color: "#f59e0b",
        icon: "warning",
        title: "Rechazar reserva",
        confirmText: "Rechazar",
        confirmColor: "#f59e0b",
      },
    };

    const config = estadoConfig[nuevoEstado] || {
      color: "#6b7280",
      icon: "question",
      title: `Cambiar estado a ${nuevoEstado}`,
      confirmText: "Confirmar",
      confirmColor: "#6b7280",
    };

    const result = await Swal.fire({
      title: config.title,
      html: `
        <div class="text-left space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold">Amenidad:</span>
            <span>${reserva.amenidadNombre}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Usuario:</span>
            <span>${reserva.nombreUsuario}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Casa:</span>
            <span>${reserva.numeroCasa}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Estado actual:</span>
            <span>${reserva.estado}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Nuevo estado:</span>
            <span class="font-bold" style="color: ${
              config.color
            }">${nuevoEstado}</span>
          </div>
          ${
            nuevoEstado === "Rechazada"
              ? '<p class="mt-3 text-amber-600 text-sm font-medium">El usuario será notificado sobre el rechazo de su reserva.</p>'
              : ""
          }
        </div>
      `,
      icon: config.icon,
      showCancelButton: true,
      confirmButtonColor: config.confirmColor,
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Sí, ${config.confirmText.toLowerCase()}`,
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await actualizarEstadoReserva(reserva.reservaID, nuevoEstado);
        } catch (error) {
          Swal.showValidationMessage(
            `Error: ${
              error?.response?.data?.message ||
              error.message ||
              "No se pudo actualizar el estado"
            }`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed) {
      const successTitle =
        nuevoEstado === "Aprobada"
          ? "¡Reserva aprobada!"
          : nuevoEstado === "Rechazada"
          ? "Reserva rechazada"
          : "Estado actualizado";

      const successText =
        nuevoEstado === "Aprobada"
          ? "La reserva ha sido aprobada exitosamente."
          : nuevoEstado === "Rechazada"
          ? "La reserva ha sido rechazada."
          : "El estado de la reserva ha sido actualizado.";

      await Swal.fire({
        title: successTitle,
        text: successText,
        icon: "success",
        confirmButtonColor: "#10b981",
      });
    }
  };

  // Filtro de búsqueda
  const reservasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return reservas || [];
    return (reservas || []).filter((r) => {
      return (
        r.amenidadNombre?.toLowerCase().includes(term) ||
        r.tipoAmenidad?.toLowerCase().includes(term) ||
        r.nombreUsuario?.toLowerCase().includes(term) ||
        r.numeroCasa?.toLowerCase().includes(term) ||
        r.motivo?.toLowerCase().includes(term)
      );
    });
  }, [busqueda, reservas]);

  const badgeEstado = (estado) => {
    const value = (estado || "Pendiente").toLowerCase();

    if (value === "aprobada") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
          Aprobada
        </span>
      );
    }
    if (value === "rechazada") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
          Rechazada
        </span>
      );
    }
    if (value === "cancelada") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          Cancelada
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        Pendiente
      </span>
    );
  };

  // Mostrar error con SweetAlert si existe
  useEffect(() => {
    if (errorFinal) {
      Swal.fire({
        title: "Error",
        text: errorFinal,
        icon: "error",
        confirmButtonColor: "#ef4444",
      }).then(() => {
        setLocalError("");
      });
    }
  }, [errorFinal]);

  return (
    <div className="p-4 md:p-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Reservas</h1>
          <p className="text-sm text-slate-500">
            Administra las reservas de las amenidades del condominio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              className="w-full sm:w-72 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Buscar por amenidad, usuario, casa o motivo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleNueva}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
            disabled={loading || saving}
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Procesando...
              </>
            ) : (
              "+ Nueva reserva"
            )}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mb-4 flex items-center justify-center text-sm text-slate-500">
          <svg
            className="animate-spin mr-2 h-4 w-4 text-emerald-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Cargando reservas...
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            {/* Encabezado verde */}
            <thead className="bg-emerald-700 text-white text-xs md:text-sm">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Amenidad</th>
                <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                <th className="px-4 py-3 text-center font-semibold">Casa</th>
                <th className="px-4 py-3 text-center font-semibold">Fecha</th>
                <th className="px-4 py-3 text-center font-semibold">Horario</th>
                <th className="px-4 py-3 text-left font-semibold">Motivo</th>
                <th className="px-4 py-3 text-center font-semibold">Estado</th>
                <th className="px-4 py-3 text-center font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {reservasFiltradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin mr-2 h-4 w-4 text-emerald-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Cargando...
                      </div>
                    ) : busqueda ? (
                      <div className="space-y-2">
                        <div className="text-slate-400">
                          No se encontraron reservas para "{busqueda}"
                        </div>
                        <button
                          onClick={() => setBusqueda("")}
                          className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          Limpiar búsqueda
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-slate-400">
                          No hay reservas registradas
                        </div>
                        <button
                          onClick={handleNueva}
                          className="px-4 py-2 text-sm rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Crear primera reserva
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                reservasFiltradas.map((r) => (
                  <tr
                    key={r.reservaID}
                    className="border-t border-slate-100 hover:bg-emerald-50/70 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {r.amenidadNombre}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.tipoAmenidad}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.nombreUsuario}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {r.numeroCasa}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {String(r.fechaReserva).slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {r.horaInicio?.slice(0, 5)} - {r.horaFin?.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                      {r.motivo}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {badgeEstado(r.estado)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col sm:flex-row gap-1 justify-center">
                        {r.estado !== "Aprobada" &&
                          r.estado !== "Cancelada" && (
                            <button
                              type="button"
                              onClick={() => handleEstado(r, "Aprobada")}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                              disabled={saving}
                            >
                              Aprobar
                            </button>
                          )}
                        {r.estado !== "Rechazada" &&
                          r.estado !== "Cancelada" && (
                            <button
                              type="button"
                              onClick={() => handleEstado(r, "Rechazada")}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
                              disabled={saving}
                            >
                              Rechazar
                            </button>
                          )}
                        {r.estado !== "Cancelada" && (
                          <button
                            type="button"
                            onClick={() => handleCancelar(r)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                            disabled={saving}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal formulario */}
      {openForm && (
        <ReservaForm
          open={openForm}
          onClose={handleCerrarForm}
          onSubmit={handleSubmitForm}
          amenidades={amenidades}
          saving={saving}
        />
      )}
    </div>
  );
}
