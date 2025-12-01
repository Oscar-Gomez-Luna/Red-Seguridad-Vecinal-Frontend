import { useEffect, useState } from "react";

export default function PersonalMantenimientoForm({
  open,
  onClose,
  onSubmit,
  initial,
  mode = "create",
}) {
  const [form, setForm] = useState({
    personaID: "",
    puesto: "",
    fechaContratacion: "",
    sueldo: "",
    tipoContrato: "",
    turno: "",
    diasLaborales: "",
    notas: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        personaID: initial.personaID ?? "",
        puesto: initial.puesto ?? "",
        fechaContratacion: initial.fechaContratacion?.slice(0, 10) ?? "",
        sueldo: initial.sueldo ?? "",
        tipoContrato: initial.tipoContrato ?? "",
        turno: initial.turno ?? "",
        diasLaborales: initial.diasLaborales ?? "",
        notas: initial.notas ?? "",
      });
    } else {
      setForm({
        personaID: "",
        puesto: "",
        fechaContratacion: "",
        sueldo: "",
        tipoContrato: "",
        turno: "",
        diasLaborales: "",
        notas: "",
      });
    }
  }, [initial, open]);

  if (!open) return null;

  const handleChange = (evt) => {
    if (mode === "view") return;
    const { name, value } = evt.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};

    if (!String(form.personaID).trim()) e.personaID = "Persona requerida";
    if (!form.puesto.trim()) e.puesto = "Puesto requerido";
    if (!form.fechaContratacion) e.fechaContratacion = "Fecha requerida";
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

  const handleSubmit = (evt) => {
    evt.preventDefault();
    if (mode === "view") {
      onClose();
      return;
    }

    if (!validate()) return;

    onSubmit({
      personaID: Number(form.personaID),
      puesto: form.puesto.trim(),
      fechaContratacion: form.fechaContratacion,
      sueldo: Number(form.sueldo),
      tipoContrato: form.tipoContrato.trim(),
      turno: form.turno.trim(),
      diasLaborales: form.diasLaborales.trim(),
      notas: form.notas.trim(),
    });
  };

  const isViewMode = mode === "view";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="bg-emerald-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isViewMode
              ? "Detalles del Personal"
              : initial
              ? "Editar Personal"
              : "Nuevo Personal de Mantenimiento"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Persona ID */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ID de Persona
            </label>
            <input
              type="number"
              name="personaID"
              value={form.personaID}
              onChange={handleChange}
              disabled={isViewMode}
              className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isViewMode ? "bg-slate-100 text-slate-600" : ""
              }`}
              placeholder="Ingresa el ID de la persona"
            />
            {errors.personaID && (
              <p className="text-xs text-red-500 mt-1">{errors.personaID}</p>
            )}
          </div>

          {/* Puesto y Sueldo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Puesto
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
                Sueldo Mensual
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

          {/* Fecha y Tipo de Contrato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha de Contratación
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
                Tipo de Contrato
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

          {/* Turno y Días Laborales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Turno
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
                Días Laborales
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

          {/* Notas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              name="notas"
              value={form.notas}
              onChange={handleChange}
              disabled={isViewMode}
              rows={3}
              className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
                isViewMode ? "bg-slate-100 text-slate-600" : ""
              }`}
              placeholder="Información adicional sobre el personal..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-slate-600 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
            >
              {isViewMode ? "Cerrar" : "Cancelar"}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="px-4 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                {initial ? "Guardar Cambios" : "Registrar Personal"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
