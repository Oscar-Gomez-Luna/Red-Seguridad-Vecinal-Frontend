import { useEffect, useState } from "react";

export default function PersonalMantenimientoForm({
  open,
  onClose,
  onSubmit,
  onUpdate,
  initial,
  mode = "create",
  onModificar,
}) {
  const [form, setForm] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    telefono: "",
    email: "",
    fechaNacimiento: "",
    puesto: "",
    fechaContratacion: "",
    sueldo: "",
    tipoContrato: "",
    turno: "",
    diasLaborales: "",
    notas: "",
  });

  const [currentMode, setCurrentMode] = useState(mode);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Agregar esta línea

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  useEffect(() => {
    if (initial) {
      setForm({
        nombre: initial.nombre || "",
        apellidoPaterno: initial.apellidoPaterno || "",
        apellidoMaterno: initial.apellidoMaterno || "",
        telefono: initial.telefono || "",
        email: initial.email || "",
        fechaNacimiento: initial.fechaNacimiento || "",
        puesto: initial.puesto || "",
        fechaContratacion: initial.fechaContratacion || "",
        sueldo: initial.sueldo ?? "",
        tipoContrato: initial.tipoContrato || "",
        turno: initial.turno || "",
        diasLaborales: initial.diasLaborales || "",
        notas: initial.notas || "",
      });
    } else {
      setForm({
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        telefono: "",
        email: "",
        fechaNacimiento: "",
        puesto: "",
        fechaContratacion: "",
        sueldo: "",
        tipoContrato: "",
        turno: "",
        diasLaborales: "",
        notas: "",
      });
    }
    setErrors({});
    setIsSubmitting(false);
  }, [initial, open]);

  if (!open) return null;

  const validate = () => {
    const e = {};

    if (currentMode === "create") {
      if (!form.nombre.trim()) e.nombre = "Nombre requerido";
      if (!form.apellidoPaterno.trim())
        e.apellidoPaterno = "Apellido paterno requerido";
      if (!form.telefono.trim()) e.telefono = "Teléfono requerido";
    }

    if (!form.puesto.trim()) e.puesto = "Puesto requerido";
    if (!form.fechaContratacion)
      e.fechaContratacion = "Fecha de contratación requerida";
    if (form.sueldo === "" || Number(form.sueldo) <= 0)
      e.sueldo = "Sueldo debe ser mayor a 0";
    if (!form.tipoContrato.trim())
      e.tipoContrato = "Tipo de contrato requerido";
    if (!form.turno.trim()) e.turno = "Turno requerido";
    if (!form.diasLaborales.trim())
      e.diasLaborales = "Días laborales requeridos";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (evt) => {
    if (currentMode === "view") return;
    const { name, value } = evt.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (currentMode === "view") {
      onClose();
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (currentMode === "create") {
        // Para crear, enviamos todos los datos
        const payload = {
          nombre: form.nombre.trim(),
          apellidoPaterno: form.apellidoPaterno.trim(),
          apellidoMaterno: form.apellidoMaterno.trim() || null,
          telefono: form.telefono.trim(),
          email: form.email.trim() || null,
          fechaNacimiento: form.fechaNacimiento || null,
          puesto: form.puesto.trim(),
          fechaContratacion: form.fechaContratacion,
          sueldo: Number(form.sueldo),
          tipoContrato: form.tipoContrato.trim(),
          turno: form.turno.trim(),
          diasLaborales: form.diasLaborales.trim(),
          notas: form.notas.trim() || null,
        };
        await onSubmit(payload);
      } else if (currentMode === "edit" && initial) {
        // Para editar, ahora enviamos todos los datos usando la nueva API
        const payload = {
          nombre: form.nombre.trim(),
          apellidoPaterno: form.apellidoPaterno.trim(),
          apellidoMaterno: form.apellidoMaterno.trim() || null,
          telefono: form.telefono.trim(),
          email: form.email.trim() || null,
          fechaNacimiento: form.fechaNacimiento || null,
          puesto: form.puesto.trim(),
          fechaContratacion: form.fechaContratacion,
          sueldo: Number(form.sueldo),
          tipoContrato: form.tipoContrato.trim(),
          turno: form.turno.trim(),
          diasLaborales: form.diasLaborales.trim(),
          notas: form.notas.trim() || null,
        };
        await onUpdate(initial.personalMantenimientoID, payload);
      }

      onClose(); // Cambiar setFormOpen por onClose
    } catch (err) {
      console.error("Error al guardar:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModificar = () => {
    setCurrentMode("edit");
    if (onModificar) {
      onModificar();
    }
  };

  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isViewMode
              ? "Detalles del Personal"
              : isEditMode
              ? "Editar Personal"
              : "Nuevo Personal de Mantenimiento"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Campos de persona - solo en modo crear */}
          {currentMode === "create" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isViewMode ? "bg-slate-100 text-slate-600" : ""
                    }`}
                    placeholder="Ingresa el nombre"
                  />
                  {errors.nombre && (
                    <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Apellido Paterno *
                  </label>
                  <input
                    type="text"
                    name="apellidoPaterno"
                    value={form.apellidoPaterno}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isViewMode ? "bg-slate-100 text-slate-600" : ""
                    }`}
                    placeholder="Ingresa el apellido paterno"
                  />
                  {errors.apellidoPaterno && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.apellidoPaterno}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    name="apellidoMaterno"
                    value={form.apellidoMaterno}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isViewMode ? "bg-slate-100 text-slate-600" : ""
                    }`}
                    placeholder="Ingresa el apellido materno"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isViewMode ? "bg-slate-100 text-slate-600" : ""
                    }`}
                    placeholder="Ingresa el teléfono"
                  />
                  {errors.telefono && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.telefono}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isViewMode ? "bg-slate-100 text-slate-600" : ""
                    }`}
                    placeholder="Ingresa el email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isViewMode ? "bg-slate-100 text-slate-600" : ""
                    }`}
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos de persona - en modo edición también */}
          {(currentMode === "edit" || currentMode === "view") && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isViewMode ? "bg-slate-100 text-slate-600" : ""
                    }`}
                    placeholder="Ingresa el nombre"
                  />
                  {errors.nombre && (
                    <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Apellido Paterno
                  </label>
                  <input
                    type="text"
                    name="apellidoPaterno"
                    value={form.apellidoPaterno}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isViewMode ? "bg-slate-100 text-slate-600" : ""
                    }`}
                    placeholder="Ingresa el apellido paterno"
                  />
                  {errors.apellidoPaterno && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.apellidoPaterno}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    name="apellidoMaterno"
                    value={form.apellidoMaterno}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isViewMode ? "bg-slate-100 text-slate-600" : ""
                    }`}
                    placeholder="Ingresa el apellido materno"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isViewMode ? "bg-slate-100 text-slate-600" : ""
                    }`}
                    placeholder="Ingresa el teléfono"
                  />
                  {errors.telefono && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.telefono}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isViewMode ? "bg-slate-100 text-slate-600" : ""
                    }`}
                    placeholder="Ingresa el email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isViewMode ? "bg-slate-100 text-slate-600" : ""
                    }`}
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos del personal - siempre visibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Puesto *
              </label>
              <input
                type="text"
                name="puesto"
                value={form.puesto}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isViewMode ? "bg-slate-100 text-slate-600" : ""
                }`}
                placeholder="Ej. Jardinero, Electricista"
              />
              {errors.puesto && (
                <p className="text-xs text-red-500 mt-1">{errors.puesto}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sueldo Mensual *
              </label>
              <input
                type="number"
                name="sueldo"
                value={form.sueldo}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isViewMode ? "bg-slate-100 text-slate-600" : ""
                }`}
                placeholder="0.00"
              />
              {errors.sueldo && (
                <p className="text-xs text-red-500 mt-1">{errors.sueldo}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha de Contratación *
              </label>
              <input
                type="date"
                name="fechaContratacion"
                value={form.fechaContratacion}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isViewMode ? "bg-slate-100 text-slate-600" : ""
                }`}
              />
              {errors.fechaContratacion && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.fechaContratacion}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Contrato *
              </label>
              <select
                name="tipoContrato"
                value={form.tipoContrato}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isViewMode ? "bg-slate-100 text-slate-600" : ""
                }`}
              >
                <option value="">Selecciona una opción</option>
                <option value="Indefinido">Indefinido</option>
                <option value="Temporal">Temporal</option>
                <option value="Por proyecto">Por proyecto</option>
              </select>
              {errors.tipoContrato && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.tipoContrato}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Turno *
              </label>
              <select
                name="turno"
                value={form.turno}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isViewMode ? "bg-slate-100 text-slate-600" : ""
                }`}
              >
                <option value="">Selecciona turno</option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Nocturno">Nocturno</option>
                <option value="Mixto">Mixto</option>
              </select>
              {errors.turno && (
                <p className="text-xs text-red-500 mt-1">{errors.turno}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Días Laborales *
              </label>
              <select
                name="diasLaborales"
                value={form.diasLaborales}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isViewMode ? "bg-slate-100 text-slate-600" : ""
                }`}
              >
                <option value="">Selecciona días</option>
                <option value="Lunes-Viernes">Lunes a Viernes</option>
                <option value="Lunes-Sábado">Lunes a Sábado</option>
                <option value="Martes-Sábado">Martes a Sábado</option>
                <option value="Miércoles-Domingo">Miércoles a Domingo</option>
                <option value="Lunes-Domingo">Lunes a Domingo</option>
              </select>
              {errors.diasLaborales && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.diasLaborales}
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              name="notas"
              rows={3}
              value={form.notas}
              onChange={handleChange}
              disabled={isViewMode}
              className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
                isViewMode ? "bg-slate-100 text-slate-600" : ""
              }`}
              placeholder="Información adicional sobre el personal..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-full bg-slate-600 text-white text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {isViewMode ? "Cerrar" : "Cancelar"}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting
                  ? "Guardando..."
                  : isEditMode
                  ? "Guardar Cambios"
                  : "Registrar Personal"}
              </button>
            )}
            {isViewMode && (
              <button
                type="button"
                onClick={handleModificar}
                className="px-4 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Modificar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
