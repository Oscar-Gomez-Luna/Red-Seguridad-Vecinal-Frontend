// src/pages/servicios/PersonalMantenimientoForm.jsx
import { useEffect, useMemo, useState } from "react";
import { ServiciosPersonalAPI } from "../../services/serviciosPersonal.api";

export default function PersonalMantenimientoForm({
  open,
  onClose,
  onSubmit,
  initial,
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

  // Personas para buscador
  const [personas, setPersonas] = useState([]);
  const [personaSearch, setPersonaSearch] = useState("");
  const [loadingPersonas, setLoadingPersonas] = useState(false);

  // Control de lista de sugerencias
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // Cargar personas para selector cuando se abre el modal
  useEffect(() => {
    if (!open) return;

    const cargarPersonas = async () => {
      try {
        setLoadingPersonas(true);
        setErrors((e) => ({ ...e, personaID: undefined }));

        const data =
          (await ServiciosPersonalAPI.getPersonasParaSelector()) || [];

        setPersonas(data);
      } catch (err) {
        console.error("Error al cargar personas:", err);
        setErrors((e) => ({
          ...e,
          personaID:
            "No se pudo cargar la lista de personas. Intenta de nuevo más tarde.",
        }));
      } finally {
        setLoadingPersonas(false);
      }
    };

    cargarPersonas();
  }, [open]);

  // Cargar datos iniciales para editar
  useEffect(() => {
    if (initial) {
      setForm({
        personaID: initial.personaID || "",
        puesto: initial.puesto || "",
        fechaContratacion: initial.fechaContratacion || "",
        sueldo: initial.sueldo ?? "",
        tipoContrato: initial.tipoContrato || "",
        turno: initial.turno || "",
        diasLaborales: initial.diasLaborales || "",
        notas: initial.notas || "",
      });

      const nombreCompleto =
        initial.nombrePersona ||
        initial.nombreCompleto ||
        initial.emailPersona ||
        "";

      setPersonaSearch(nombreCompleto);
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
      setPersonaSearch("");
    }
    setErrors({});
    setShowSuggestions(false);
    setHighlightIndex(-1);
  }, [initial, open]);

  // Personas filtradas por búsqueda (nombre o correo)
  const personasFiltradas = useMemo(() => {
    const q = personaSearch.trim().toLowerCase();
    if (!q) return personas;

    return personas.filter((p) => {
      const nombre = p.nombreCompleto || p.nombrePersona || p.nombre || "";
      const email = p.emailPersona || p.email || "";
      return (
        nombre.toLowerCase().includes(q) || email.toLowerCase().includes(q)
      );
    });
  }, [personas, personaSearch]);

  // Ajustar índice resaltado cuando cambia la lista
  useEffect(() => {
    if (!personasFiltradas.length) {
      setHighlightIndex(-1);
      return;
    }
    setHighlightIndex((prev) => {
      if (prev < 0) return -1;
      if (prev >= personasFiltradas.length) return personasFiltradas.length - 1;
      return prev;
    });
  }, [personasFiltradas]);

  const validate = () => {
    const e = {};

    if (!String(form.personaID).trim())
      e.personaID = "Debes seleccionar una persona.";
    if (!form.puesto.trim()) e.puesto = "Puesto requerido.";
    if (!form.fechaContratacion) e.fechaContratacion = "Fecha requerida.";
    if (form.sueldo === "" || Number(form.sueldo) <= 0)
      e.sueldo = "Sueldo debe ser mayor a 0.";
    if (!form.tipoContrato.trim())
      e.tipoContrato = "Tipo de contrato requerido.";
    if (!form.turno.trim()) e.turno = "Turno requerido.";
    if (!form.diasLaborales.trim())
      e.diasLaborales = "Días laborales requeridos.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
    if (!validate()) return;

    const payload = {
      personaID: Number(form.personaID),
      puesto: form.puesto.trim(),
      fechaContratacion: form.fechaContratacion,
      sueldo: Number(form.sueldo),
      tipoContrato: form.tipoContrato.trim(),
      turno: form.turno.trim(),
      diasLaborales: form.diasLaborales.trim(),
      notas: form.notas.trim() || null,
    };

    onSubmit(payload);
  };

  const handleSelectPersona = (persona) => {
    const nombreCompleto =
      persona.nombreCompleto ||
      persona.nombrePersona ||
      persona.nombre ||
      persona.emailPersona ||
      persona.email ||
      "";

    setForm((f) => ({ ...f, personaID: persona.personaID || persona.id }));
    setPersonaSearch(nombreCompleto);
    setErrors((e) => ({ ...e, personaID: undefined }));
    setShowSuggestions(false);
    setHighlightIndex(-1);
  };

  const handlePersonaKeyDown = (e) => {
    if (!personasFiltradas.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowSuggestions(true);
      setHighlightIndex((prev) => {
        const next = prev + 1;
        if (next >= personasFiltradas.length) return 0;
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setShowSuggestions(true);
      setHighlightIndex((prev) => {
        const next = prev - 1;
        if (next < 0) return personasFiltradas.length - 1;
        return next;
      });
    } else if (e.key === "Enter") {
      if (showSuggestions && highlightIndex >= 0) {
        e.preventDefault();
        const persona = personasFiltradas[highlightIndex];
        if (persona) handleSelectPersona(persona);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-semibold text-slate-800">
            {initial
              ? "Editar personal de mantenimiento"
              : "Nuevo personal de mantenimiento"}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Persona buscador */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Persona (buscar por nombre o correo)
            </label>

            <input
              type="text"
              value={personaSearch}
              onChange={(e) => {
                setPersonaSearch(e.target.value);
                setForm((f) => ({ ...f, personaID: "" }));
                setShowSuggestions(true);
                setHighlightIndex(-1);
              }}
              onFocus={() => {
                if (personaSearch.trim()) setShowSuggestions(true);
              }}
              onKeyDown={handlePersonaKeyDown}
              placeholder="Ej. Juan López o juan@correo.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {loadingPersonas && (
              <p className="text-xs text-slate-400 mt-1">
                Cargando personas...
              </p>
            )}

            {!loadingPersonas && personaSearch.trim() && showSuggestions && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm text-sm">
                {personasFiltradas.length === 0 && (
                  <div className="px-3 py-2 text-slate-400">
                    No se encontraron personas.
                  </div>
                )}

                {personasFiltradas.map((p, index) => {
                  const nombre =
                    p.nombreCompleto || p.nombrePersona || p.nombre || "";
                  const email = p.emailPersona || p.email || "";
                  const isActive = index === highlightIndex;

                  return (
                    <button
                      key={p.personaID || p.id}
                      type="button"
                      onClick={() => handleSelectPersona(p)}
                      className={`w-full text-left px-3 py-2 hover:bg-emerald-50 ${
                        isActive ? "bg-emerald-50" : ""
                      }`}
                    >
                      <div className="font-medium text-slate-800">{nombre}</div>
                      {email && (
                        <div className="text-xs text-slate-500">{email}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {form.personaID && personaSearch && (
              <p className="text-xs text-emerald-600 mt-1">
                Persona seleccionada: {personaSearch}
              </p>
            )}

            {errors.personaID && (
              <p className="text-xs text-red-500 mt-1">{errors.personaID}</p>
            )}
          </div>

          {/* Puesto y sueldo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Puesto
              </label>
              <input
                type="text"
                name="puesto"
                value={form.puesto}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.puesto && (
                <p className="text-xs text-red-500 mt-1">{errors.puesto}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sueldo mensual
              </label>
              <input
                type="number"
                name="sueldo"
                value={form.sueldo}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.sueldo && (
                <p className="text-xs text-red-500 mt-1">{errors.sueldo}</p>
              )}
            </div>
          </div>

          {/* Fecha y tipo contrato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha de contratación
              </label>
              <input
                type="date"
                name="fechaContratacion"
                value={form.fechaContratacion}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.fechaContratacion && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.fechaContratacion}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipo de contrato
              </label>
              <select
                name="tipoContrato"
                value={form.tipoContrato}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          {/* Turno y días laborales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Turno
              </label>
              <input
                type="text"
                name="turno"
                value={form.turno}
                onChange={handleChange}
                placeholder="Ej. Matutino, Vespertino, Nocturno"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.turno && (
                <p className="text-xs text-red-500 mt-1">{errors.turno}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Días laborales
              </label>
              <input
                type="text"
                name="diasLaborales"
                value={form.diasLaborales}
                onChange={handleChange}
                placeholder="Ej. Lunes a viernes"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.diasLaborales && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.diasLaborales}
                </p>
              )}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notas
            </label>
            <textarea
              name="notas"
              rows={3}
              value={form.notas}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {initial ? "Guardar cambios" : "Registrar personal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
