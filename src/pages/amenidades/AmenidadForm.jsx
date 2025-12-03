// src/pages/amenidades/AmenidadForm.jsx
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

export default function AmenidadForm({
  open,
  onClose,
  onSubmit,
  tiposAmenidad = [],
  initial,
  saving = false,
}) {
  const [form, setForm] = useState({
    tipoAmenidadID: "",
    nombre: "",
    ubicacion: "",
    capacidad: "",
  });

  const [errors, setErrors] = useState({});
  const isEditing = !!initial; // Determinar si estamos en modo edición

  // Carga inicial / edición
  useEffect(() => {
    if (initial) {
      setForm({
        tipoAmenidadID: initial.tipoAmenidadID ?? "",
        nombre: initial.nombre ?? "",
        ubicacion: initial.ubicacion ?? "",
        capacidad: initial.capacidad ?? "",
      });
    } else {
      setForm({
        tipoAmenidadID: "",
        nombre: "",
        ubicacion: "",
        capacidad: "",
      });
    }
    setErrors({});
  }, [initial, open]);

  // Tipo seleccionado para mostrar horario sugerido
  const tipoSeleccionado = useMemo(
    () =>
      tiposAmenidad.find(
        (t) => t.tipoAmenidadID === Number(form.tipoAmenidadID)
      ),
    [tiposAmenidad, form.tipoAmenidadID]
  );

  const handleChange = (e) => {
    if (isEditing) return; // No permitir cambios en modo edición

    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "capacidad" ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleCancel = async () => {
    if (isEditing) {
      // En modo edición, simplemente cerrar
      onClose();
    } else {
      // En modo creación, verificar si hay datos ingresados
      const hasData = Object.values(form).some(
        (value) => value && value.toString().trim() !== ""
      );

      if (hasData) {
        const result = await Swal.fire({
          title: "¿Descartar cambios?",
          text: "Tienes datos ingresados que se perderán. ¿Seguro que quieres cancelar?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#ef4444",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Sí, descartar",
          cancelButtonText: "Continuar editando",
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          onClose();
        }
      } else {
        onClose();
      }
    }
  };

  const validar = () => {
    const errs = {};

    if (!form.tipoAmenidadID) errs.tipoAmenidadID = "Selecciona un tipo.";
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!form.ubicacion.trim()) errs.ubicacion = "La ubicación es obligatoria.";
    if (!form.capacidad) {
      errs.capacidad = "La capacidad es obligatoria.";
    } else if (Number(form.capacidad) <= 0) {
      errs.capacidad = "La capacidad debe ser mayor a 0.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) return; // No permitir envío en modo edición

    if (!validar()) return;

    // Mostrar confirmación antes de crear
    const tipoNombre =
      tiposAmenidad.find(
        (t) => t.tipoAmenidadID === Number(form.tipoAmenidadID)
      )?.nombre || "Sin tipo";

    const result = await Swal.fire({
      title: "¿Crear nueva amenidad?",
      html: `
        <div class="text-left space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold">Tipo:</span>
            <span>${tipoNombre}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Nombre:</span>
            <span>${form.nombre}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Ubicación:</span>
            <span>${form.ubicacion}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Capacidad:</span>
            <span>${form.capacidad} personas</span>
          </div>
          ${
            tipoSeleccionado
              ? `
          <div class="flex items-center justify-between">
            <span class="font-semibold">Horario:</span>
            <span>${tipoSeleccionado.horarioInicio?.slice(
              0,
              5
            )} - ${tipoSeleccionado.horarioFin?.slice(0, 5)}</span>
          </div>
          `
              : ""
          }
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
          const payload = {
            tipoAmenidadID: Number(form.tipoAmenidadID),
            nombre: form.nombre.trim(),
            ubicacion: form.ubicacion.trim(),
            capacidad: Number(form.capacidad),
          };

          await onSubmit(payload);
        } catch (error) {
          Swal.showValidationMessage(
            `Error: ${
              error?.response?.data?.message ||
              error.message ||
              "No se pudo crear la amenidad"
            }`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: "¡Amenidad creada!",
        text: "La amenidad se ha registrado exitosamente.",
        icon: "success",
        confirmButtonColor: "#10b981",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-3">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEditing ? (
              <>
                <span className="text-emerald-600">Vista de amenidad</span>
                <span className="text-slate-400 mx-1">|</span>
                <span className="text-sm font-normal">{initial?.nombre}</span>
              </>
            ) : (
              "Nueva amenidad"
            )}
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
            disabled={saving}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Tipo de amenidad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo de amenidad
            </label>
            <select
              name="tipoAmenidadID"
              value={form.tipoAmenidadID}
              onChange={handleChange}
              disabled={isEditing || saving}
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${
                isEditing
                  ? "bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed"
                  : "border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              }`}
            >
              <option value="">Selecciona un tipo...</option>
              {tiposAmenidad.map((t) => (
                <option key={t.tipoAmenidadID} value={t.tipoAmenidadID}>
                  {t.nombre}
                </option>
              ))}
            </select>
            {errors.tipoAmenidadID && !isEditing && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.tipoAmenidadID}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              disabled={isEditing || saving}
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${
                isEditing
                  ? "bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed"
                  : "border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              }`}
              placeholder="Ej. Gimnasio Central"
            />
            {errors.nombre && !isEditing && (
              <p className="mt-1 text-xs text-rose-600">{errors.nombre}</p>
            )}
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              disabled={isEditing || saving}
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${
                isEditing
                  ? "bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed"
                  : "border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              }`}
              placeholder="Ej. Planta baja, exterior, etc."
            />
            {errors.ubicacion && !isEditing && (
              <p className="mt-1 text-xs text-rose-600">{errors.ubicacion}</p>
            )}
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Capacidad (personas)
            </label>
            <input
              type="text"
              name="capacidad"
              value={form.capacidad}
              onChange={handleChange}
              disabled={isEditing || saving}
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${
                isEditing
                  ? "bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed"
                  : "border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              }`}
              placeholder="Ej. 20"
            />
            {errors.capacidad && !isEditing && (
              <p className="mt-1 text-xs text-rose-600">{errors.capacidad}</p>
            )}
          </div>

          {/* Horario (solo lectura desde el tipo) */}
          {tipoSeleccionado && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600">
              <p>
                <span className="font-semibold">Horario sugerido: </span>
                {tipoSeleccionado.horarioInicio?.slice(0, 5)} -{" "}
                {tipoSeleccionado.horarioFin?.slice(0, 5)}
              </p>
              <p className="mt-1">
                (El horario se toma del tipo de amenidad configurado en el
                sistema.)
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-1">
            {isEditing ? (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                disabled={saving}
              >
                Cerrar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Registrar amenidad"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
