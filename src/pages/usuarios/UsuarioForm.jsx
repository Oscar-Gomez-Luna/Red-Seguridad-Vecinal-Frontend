// src/app/pages/usuarios/UsuarioForm.jsx
import { useEffect, useState } from "react";
import { parseTipoUsuarioID } from "./tiposUsuario";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Home,
  MapPin,
  Save,
  X,
  CreditCard,
  Shield,
  UserCog,
} from "lucide-react";

const emptyForm = {
  usuarioID: null,
  tipoUsuarioID: "",
  numeroCasa: "",
  calle: "",
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  telefono: "",
  fechaNacimiento: "",
  email: "",
  password: "",
  numeroTarjeta: "",
  fechaVencimiento: "",
};

export default function UsuarioForm({
  initial,
  tipos = [],
  onCancel,
  onSubmit,
  saving,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initial) {
      setForm({
        usuarioID: initial.usuarioID ?? null,
        tipoUsuarioID:
          initial.tipoUsuarioID ??
          parseTipoUsuarioID(initial.tipoUsuario) ??
          "",
        numeroCasa: initial.numeroCasa ?? "",
        calle: initial.calle ?? "",
        nombre: initial.nombre ?? "",
        apellidoPaterno: initial.apellidoPaterno ?? "",
        apellidoMaterno: initial.apellidoMaterno ?? "",
        telefono: initial.telefono ?? "",
        fechaNacimiento: initial.fechaNacimiento
          ? initial.fechaNacimiento.substring(0, 10)
          : "",
        email: initial.email ?? "",
        password: "",
        numeroTarjeta: "",
        fechaVencimiento: initial.fechaVencimiento ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      tipoUsuarioID: Number(form.tipoUsuarioID || 0),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl p-6 space-y-6"
    >
      {/* Tipo de Usuario */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserCog className="w-5 h-5 text-emerald-600" />
          Tipo de Usuario
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Rol del usuario *
          </label>
          <select
            name="tipoUsuarioID"
            value={form.tipoUsuarioID}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            required
            disabled
          >
            <option value="">Seleccione un tipo</option>
            {tipos.map((t) => (
              <option key={t.tipoUsuarioID} value={t.tipoUsuarioID}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Información Personal */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          Información Personal
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre(s) *
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Apellido Paterno *
            </label>
            <input
              name="apellidoPaterno"
              value={form.apellidoPaterno}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Apellido Materno
            </label>
            <input
              name="apellidoMaterno"
              value={form.apellidoMaterno}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-emerald-600" />
          Contacto
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Mail className="w-4 h-4 inline mr-1" />
              Correo Electrónico *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Phone className="w-4 h-4 inline mr-1" />
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej: 4771234567"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Dirección */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          Dirección
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Calle
            </label>
            <input
              name="calle"
              value={form.calle}
              onChange={handleChange}
              placeholder="Ej: Av. Principal"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Home className="w-4 h-4 inline mr-1" />
              Número de Casa
            </label>
            <input
              name="numeroCasa"
              value={form.numeroCasa}
              onChange={handleChange}
              placeholder="Ej: 123"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Información de Tarjeta */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          Método de Pago
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Número de Tarjeta
              {form.usuarioID && (
                <span className="text-xs text-gray-500 ml-1">(opcional)</span>
              )}
            </label>
            <input
              name="numeroTarjeta"
              value={form.numeroTarjeta}
              onChange={handleChange}
              placeholder={
                form.usuarioID
                  ? "Dejar vacío para mantener actual"
                  : "Ej: 1234567890"
              }
              maxLength={16}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
            {form.usuarioID && initial?.ultimosDigitos && (
              <p className="text-xs text-gray-500 mt-1">
                Tarjeta actual: ****{initial.ultimosDigitos}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Fecha de Vencimiento
            </label>
            <input
              name="fechaVencimiento"
              value={form.fechaVencimiento}
              onChange={handleChange}
              placeholder="MM-YY (Ej: 12-25)"
              maxLength={5}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          Seguridad
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Contraseña {form.usuarioID && "(opcional)"}
            {!form.usuarioID && <span className="text-rose-500">*</span>}
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder={
              form.usuarioID
                ? "Dejar vacío para no cambiar"
                : "Ingrese contraseña"
            }
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
            required={!form.usuarioID}
          />
          <p className="text-xs text-gray-500 mt-1">
            {form.usuarioID
              ? "Solo completa este campo si deseas cambiar la contraseña"
              : "La contraseña debe tener al menos 6 caracteres"}
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            onCancel, location.reload();
          }}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving
            ? "Guardando..."
            : form.usuarioID
            ? "Guardar Cambios"
            : "Crear Usuario"}
        </button>
      </div>
    </form>
  );
}
