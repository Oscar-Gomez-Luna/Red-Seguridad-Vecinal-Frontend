import { useContext, useEffect, useState } from "react";
import UsuariosContext from "../../context/Usuarios/UsuariosContext";

export default function ReservaForm({
  open,
  onClose,
  onSubmit,
  amenidades = [],
  initial,
  saving = false,
}) {
  const {
    usuarios,
    listarUsuarios,
    loading: loadingUsuarios,
  } = useContext(UsuariosContext);

  const [form, setForm] = useState({
    usuarioID: "",
    amenidadID: "",
    fechaReserva: "",
    horaInicio: "",
    horaFin: "",
    motivo: "",
  });

  const [errors, setErrors] = useState({});

  // Cargar usuarios al abrir el modal
  useEffect(() => {
    if (open && (!usuarios || usuarios.length === 0)) {
      listarUsuarios();
    }
  }, [open, usuarios, listarUsuarios]);

  // Cargar datos iniciales
  useEffect(() => {
    if (!open) return;

    if (initial) {
      setForm({
        usuarioID: initial.usuarioID ?? "",
        amenidadID: initial.amenidadID ? String(initial.amenidadID) : "",
        fechaReserva: initial.fechaReserva
          ? String(initial.fechaReserva).slice(0, 10)
          : "",
        horaInicio: initial.horaInicio?.slice(0, 5) ?? "",
        horaFin: initial.horaFin?.slice(0, 5) ?? "",
        motivo: initial.motivo ?? "",
      });
    } else {
      const hoy = new Date().toISOString().slice(0, 10);
      setForm({
        usuarioID: "",
        amenidadID: "",
        fechaReserva: hoy,
        horaInicio: "",
        horaFin: "",
        motivo: "",
      });
    }
    setErrors({});
  }, [open, initial]);

  if (!open) return null;

  // Filtrar usuarios activos de tipo Admin o Usuario
  const usuariosFiltrados = (usuarios || []).filter(
    (u) =>
      u.activo && (u.tipoUsuario === "Admin" || u.tipoUsuario === "Usuario")
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.usuarioID) e.usuarioID = "Selecciona un usuario.";
    if (!form.amenidadID) e.amenidadID = "Selecciona una amenidad.";
    if (!form.fechaReserva) e.fechaReserva = "La fecha es obligatoria.";
    if (!form.horaInicio) e.horaInicio = "La hora de inicio es obligatoria.";
    if (!form.horaFin) e.horaFin = "La hora de fin es obligatoria.";
    if (!form.motivo || form.motivo.trim().length < 3)
      e.motivo = "Describe brevemente el motivo.";
    return e;
  };

  const normalizeTime = (t) => {
    if (!t) return "";
    if (t.length === 8) return t; // HH:mm:ss
    if (t.length === 5) return `${t}:00`;
    return t;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    const payload = {
      usuarioID: Number(form.usuarioID),
      amenidadID: Number(form.amenidadID),
      fechaReserva: form.fechaReserva,
      horaInicio: normalizeTime(form.horaInicio),
      horaFin: normalizeTime(form.horaFin),
      motivo: form.motivo.trim(),
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {initial ? "Editar reserva" : "Nueva reserva"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            {/* Usuario */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Usuario
              </label>
              <select
                name="usuarioID"
                value={form.usuarioID}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={loadingUsuarios}
              >
                <option value="">
                  {loadingUsuarios
                    ? "Cargando usuarios..."
                    : "Selecciona un usuario"}
                </option>
                {usuariosFiltrados.map((u) => (
                  <option key={u.usuarioID} value={u.usuarioID}>
                    {u.nombre} {u.apellido} - Casa {u.numeroCasa} (
                    {u.tipoUsuario})
                  </option>
                ))}
              </select>
              {errors.usuarioID && (
                <p className="mt-1 text-xs text-red-600">{errors.usuarioID}</p>
              )}
            </div>

            {/* Amenidad */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Amenidad
              </label>
              <select
                name="amenidadID"
                value={form.amenidadID}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Selecciona una amenidad</option>
                {amenidades
                  .filter((a) => a.activo !== false)
                  .map((a) => (
                    <option key={a.amenidadID} value={a.amenidadID}>
                      {a.nombre}{" "}
                      {a.tipoAmenidadNombre ? `(${a.tipoAmenidadNombre})` : ""}
                    </option>
                  ))}
              </select>
              {errors.amenidadID && (
                <p className="mt-1 text-xs text-red-600">{errors.amenidadID}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {/* Fecha */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Fecha
              </label>
              <input
                type="date"
                name="fechaReserva"
                value={form.fechaReserva}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {errors.fechaReserva && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.fechaReserva}
                </p>
              )}
            </div>

            {/* Hora inicio */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Hora inicio
              </label>
              <input
                type="time"
                name="horaInicio"
                value={form.horaInicio}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {errors.horaInicio && (
                <p className="mt-1 text-xs text-red-600">{errors.horaInicio}</p>
              )}
            </div>

            {/* Hora fin */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Hora fin
              </label>
              <input
                type="time"
                name="horaFin"
                value={form.horaFin}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {errors.horaFin && (
                <p className="mt-1 text-xs text-red-600">{errors.horaFin}</p>
              )}
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Motivo
            </label>
            <textarea
              name="motivo"
              rows={3}
              value={form.motivo}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ej. Fiesta familiar, entrenamiento, junta, etc."
            />
            {errors.motivo && (
              <p className="mt-1 text-xs text-red-600">{errors.motivo}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
