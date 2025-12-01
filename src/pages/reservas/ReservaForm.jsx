// src/pages/reservas/ReservaForm.jsx
import { useEffect, useMemo, useState } from "react";

export default function ReservaForm({
  open,
  onClose,
  onSubmit,
  amenidades = [],
  usuarios = [],
  saving = false,
}) {
  const [form, setForm] = useState({
    usuarioID: "",
    amenidadID: "",
    fechaReserva: "",
    horaInicio: "",
    horaFin: "",
    motivo: "",
  });

  const [errors, setErrors] = useState({});

  // Estado para el buscador de usuarios
  const [searchUsuario, setSearchUsuario] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setForm({
        usuarioID: "",
        amenidadID: "",
        fechaReserva: "",
        horaInicio: "",
        horaFin: "",
        motivo: "",
      });
      setErrors({});
      setSearchUsuario("");
      setDropdownOpen(false);
      setHighlightIndex(0);
    }
  }, [open]);

  const filteredUsuarios = useMemo(() => {
    const term = searchUsuario.trim().toLowerCase();
    const list = usuarios || [];
    if (!term) return list.slice(0, 10);

    return list
      .filter((u) => {
        const nombre = u.nombreCompleto || "";
        const email = u.email || "";
        return (
          nombre.toLowerCase().includes(term) ||
          email.toLowerCase().includes(term)
        );
      })
      .slice(0, 10);
  }, [searchUsuario, usuarios]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [filteredUsuarios.length, dropdownOpen]);

  const handleChangeField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectUsuario = (usuario) => {
    setForm((prev) => ({ ...prev, usuarioID: usuario.usuarioID }));
    const label =
      usuario.nombreCompleto ||
      usuario.email ||
      `Usuario #${usuario.usuarioID}`;
    setSearchUsuario(label);
    setDropdownOpen(false);
  };

  const handleUsuarioKeyDown = (e) => {
    if (!dropdownOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setDropdownOpen(true);
      e.preventDefault();
      return;
    }

    if (!dropdownOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev + 1 >= filteredUsuarios.length ? 0 : prev + 1
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev - 1 < 0 ? filteredUsuarios.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const user = filteredUsuarios[highlightIndex];
      if (user) selectUsuario(user);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.usuarioID) newErrors.usuarioID = "Selecciona un usuario.";
    if (!form.amenidadID) newErrors.amenidadID = "Selecciona una amenidad.";
    if (!form.fechaReserva) newErrors.fechaReserva = "Selecciona una fecha.";
    if (!form.horaInicio) newErrors.horaInicio = "Ingresa la hora de inicio.";
    if (!form.horaFin) newErrors.horaFin = "Ingresa la hora de fin.";
    if (!form.motivo || form.motivo.trim().length < 3)
      newErrors.motivo = "Ingresa un motivo válido.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      usuarioID: Number(form.usuarioID),
      amenidadID: Number(form.amenidadID),
      fechaReserva: form.fechaReserva,
      horaInicio: form.horaInicio,
      horaFin: form.horaFin,
      motivo: form.motivo.trim(),
    };

    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Nueva reserva
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Usuario */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              USUARIO
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchUsuario}
                onChange={(e) => {
                  setSearchUsuario(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                onKeyDown={handleUsuarioKeyDown}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm pr-9 focus:outline-none focus:ring-2 ${
                  errors.usuarioID
                    ? "border-rose-400 focus:ring-rose-300"
                    : "border-emerald-400 focus:ring-emerald-300"
                }`}
              />
              <span className="absolute right-3 top-2.5 text-slate-400 text-sm">
                🔍
              </span>

              {dropdownOpen && filteredUsuarios.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg text-sm">
                  {filteredUsuarios.map((u, idx) => {
                    const label =
                      u.nombreCompleto || u.email || `Usuario #${u.usuarioID}`;
                    const email = u.email;
                    return (
                      <li
                        key={u.usuarioID}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectUsuario(u);
                        }}
                        className={`px-3 py-2 cursor-pointer flex flex-col ${
                          idx === highlightIndex
                            ? "bg-emerald-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="font-medium text-slate-800">
                          {label}
                        </span>
                        {email && (
                          <span className="text-xs text-slate-500">
                            {email}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {errors.usuarioID && (
              <p className="mt-1 text-xs text-rose-600">{errors.usuarioID}</p>
            )}
          </div>

          {/* Amenidad */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              AMENIDAD
            </label>
            <select
              name="amenidadID"
              value={form.amenidadID}
              onChange={handleChangeField}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                errors.amenidadID
                  ? "border-rose-400 focus:ring-rose-300"
                  : "border-slate-300 focus:ring-emerald-300 focus:border-emerald-400"
              }`}
            >
              <option value="">Selecciona una amenidad</option>
              {(amenidades || []).map((a) => (
                <option key={a.amenidadID} value={a.amenidadID}>
                  {a.nombre} ({a.tipoAmenidadNombre})
                </option>
              ))}
            </select>
            {errors.amenidadID && (
              <p className="mt-1 text-xs text-rose-600">{errors.amenidadID}</p>
            )}
          </div>

          {/* Fecha y horario */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                FECHA
              </label>
              <input
                type="date"
                name="fechaReserva"
                value={form.fechaReserva}
                onChange={handleChangeField}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                  errors.fechaReserva
                    ? "border-rose-400 focus:ring-rose-300"
                    : "border-slate-300 focus:ring-emerald-300 focus:border-emerald-400"
                }`}
              />
              {errors.fechaReserva && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.fechaReserva}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                HORA INICIO
              </label>
              <input
                type="time"
                name="horaInicio"
                value={form.horaInicio}
                onChange={handleChangeField}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                  errors.horaInicio
                    ? "border-rose-400 focus:ring-rose-300"
                    : "border-slate-300 focus:ring-emerald-300 focus:border-emerald-400"
                }`}
              />
              {errors.horaInicio && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.horaInicio}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                HORA FIN
              </label>
              <input
                type="time"
                name="horaFin"
                value={form.horaFin}
                onChange={handleChangeField}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                  errors.horaFin
                    ? "border-rose-400 focus:ring-rose-300"
                    : "border-slate-300 focus:ring-emerald-300 focus:border-emerald-400"
                }`}
              />
              {errors.horaFin && (
                <p className="mt-1 text-xs text-rose-600">{errors.horaFin}</p>
              )}
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              MOTIVO
            </label>
            <textarea
              name="motivo"
              value={form.motivo}
              onChange={handleChangeField}
              rows={3}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 ${
                errors.motivo
                  ? "border-rose-400 focus:ring-rose-300"
                  : "border-slate-300 focus:ring-emerald-300 focus:border-emerald-400"
              }`}
              placeholder="Ej. Fiesta familiar, entrenamiento, junta, etc."
            />
            {errors.motivo && (
              <p className="mt-1 text-xs text-rose-600">{errors.motivo}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 mt-2">
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
