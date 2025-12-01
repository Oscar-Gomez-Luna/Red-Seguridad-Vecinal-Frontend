// src/app/pages/usuarios/MiPerfil.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PerfilContext from "@/context/Perfil/PerfilContext";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Home,
  MapPin,
  Save,
  Loader2,
  CreditCard,
  Shield,
} from "lucide-react";

export default function MiPerfil() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const {
    perfil,
    loading,
    saving,
    error,
    obtenerPerfil,
    actualizarPerfil,
    clearError,
  } = useContext(PerfilContext);

  const [form, setForm] = useState({
    usuarioID: 0,
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
  });

  // Cargar datos del usuario al montar
  useEffect(() => {
    if (!authUser) {
      navigate("/auth/login");
      return;
    }

    const userId = authUser.id || authUser.usuarioID;

    if (!userId) {
      console.error("No hay userId en la sesión:", authUser);
      return;
    }

    obtenerPerfil(userId);
  }, [authUser, navigate]);

  // Actualizar formulario cuando se carga el perfil
  useEffect(() => {
    if (perfil) {
      setForm({
        usuarioID: perfil.usuarioID || 0,
        numeroCasa: perfil.numeroCasa || "",
        calle: perfil.calle || "",
        nombre: perfil.nombre || "",
        apellidoPaterno: perfil.apellidoPaterno || "",
        apellidoMaterno: perfil.apellidoMaterno || "",
        telefono: perfil.telefono || "",
        fechaNacimiento: perfil.fechaNacimiento?.substring(0, 10) || "",
        email: perfil.email || "",
        password: "", // No se muestra por seguridad
        numeroTarjeta: "", // No se muestra por seguridad
        fechaVencimiento: perfil.fechaVencimiento || "", // SÍ se muestra
      });
    }
  }, [perfil]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Validar campos requeridos
    if (!form.nombre || !form.apellidoPaterno || !form.email) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    try {
      // Preparar datos para enviar
      const dataToSend = {
        usuarioID: form.usuarioID,
        numeroCasa: form.numeroCasa || "",
        calle: form.calle || "",
        nombre: form.nombre,
        apellidoPaterno: form.apellidoPaterno,
        apellidoMaterno: form.apellidoMaterno || "",
        telefono: form.telefono || "",
        fechaNacimiento: form.fechaNacimiento || "2000-01-01",
        email: form.email,
        password: form.password || "",
        numeroTarjeta: form.numeroTarjeta || "",
        fechaVencimiento: form.fechaVencimiento || "",
      };

      const result = await actualizarPerfil(dataToSend);

      if (result.success) {
        alert("✅ Perfil actualizado correctamente");
        // Limpiar password del formulario por seguridad
        setForm((f) => ({ ...f, password: "", numeroTarjeta: "" }));
      }
    } catch (err) {
      console.error("Error al guardar el perfil:", err);
    }
  };

  if (loading && !perfil) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-8 h-8 text-emerald-600" />
          Mi Perfil
        </h1>
        <p className="text-gray-600 mt-1">Administra tu información personal</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 flex items-start justify-between">
          <div className="flex items-start gap-2">
            <span className="text-rose-500 font-bold">⚠️</span>
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-rose-400 hover:text-rose-600 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-sm rounded-2xl p-6 space-y-6"
      >
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
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
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
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
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
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Phone className="w-4 h-4 inline mr-1" />
                Teléfono
              </label>
              <input
                name="telefono"
                type="tel"
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
              </label>
              <input
                name="numeroTarjeta"
                value={form.numeroTarjeta}
                onChange={handleChange}
                placeholder="Dejar vacío para mantener actual"
                maxLength={16}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              />
              {perfil?.ultimosDigitos && (
                <p className="text-xs text-gray-500 mt-1">
                  Tarjeta actual: ****{perfil.ultimosDigitos}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Solo completa este campo si deseas cambiar tu tarjeta
              </p>
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
            <Shield className="w-5 h-5 text-emerald-600" /> Seguridad
          </h2>
          <div className="grid gap-4 md:grid-cols-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cambiar Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Dejar en blanco para no cambiar"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Solo completa este campo si deseas cambiar tu contraseña
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={() => {
              location.reload();
            }}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
