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
import Swal from "sweetalert2";

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
      Swal.fire({
        title: "Error de sesión",
        text: "No se pudo identificar tu sesión. Por favor, inicia sesión nuevamente.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      }).then(() => {
        navigate("/auth/login");
      });
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
        fechaVencimiento: perfil.fechaVencimiento || "",
      });
    }
  }, [perfil]);

  // Mostrar errores con SweetAlert
  useEffect(() => {
    if (error) {
      Swal.fire({
        title: "Error",
        text: error,
        icon: "error",
        confirmButtonColor: "#ef4444",
      }).then(() => {
        clearError();
      });
    }
  }, [error, clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Validar campos requeridos
    if (!form.nombre || !form.apellidoPaterno || !form.email) {
      await Swal.fire({
        title: "Campos incompletos",
        text: "Por favor completa los campos obligatorios: Nombre, Apellido Paterno y Correo Electrónico.",
        icon: "warning",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Entendido",
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      await Swal.fire({
        title: "Correo inválido",
        text: "Por favor ingresa un correo electrónico válido.",
        icon: "warning",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Entendido",
      });
      return;
    }

    // Validar formato de tarjeta si se proporciona
    if (
      form.numeroTarjeta &&
      !/^\d{16}$/.test(form.numeroTarjeta.replace(/\s/g, ""))
    ) {
      await Swal.fire({
        title: "Tarjeta inválida",
        text: "El número de tarjeta debe tener 16 dígitos sin espacios.",
        icon: "warning",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Entendido",
      });
      return;
    }

    // Validar formato de fecha de vencimiento si se proporciona
    if (form.fechaVencimiento && !/^\d{2}-\d{2}$/.test(form.fechaVencimiento)) {
      await Swal.fire({
        title: "Fecha inválida",
        text: "La fecha de vencimiento debe tener el formato MM-YY (ej: 12-25).",
        icon: "warning",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Entendido",
      });
      return;
    }

    // Mostrar confirmación con resumen
    const result = await Swal.fire({
      title: "¿Actualizar perfil?",
      html: `
        <div class="text-left space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div class="font-semibold">Nombre:</div>
            <div>${form.nombre} ${form.apellidoPaterno} ${
        form.apellidoMaterno || ""
      }</div>
            
            <div class="font-semibold">Correo:</div>
            <div>${form.email}</div>
            
            <div class="font-semibold">Teléfono:</div>
            <div>${form.telefono || "No especificado"}</div>
            
            <div class="font-semibold">Dirección:</div>
            <div>${form.calle || "No especificada"} ${
        form.numeroCasa || ""
      }</div>
            
            <div class="font-semibold">Tarjeta:</div>
            <div>${
              form.numeroTarjeta
                ? "****" + form.numeroTarjeta.slice(-4)
                : "No se modificará"
            }</div>
            
            <div class="font-semibold">Contraseña:</div>
            <div>${form.password ? "Se cambiará" : "No se modificará"}</div>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
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

          return await actualizarPerfil(dataToSend);
        } catch (err) {
          Swal.showValidationMessage(
            `Error: ${
              err?.response?.data?.message ||
              err.message ||
              "No se pudo actualizar el perfil"
            }`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed) {
      if (result.value?.success) {
        await Swal.fire({
          title: "¡Perfil actualizado!",
          text: "Tu información personal se ha guardado exitosamente.",
          icon: "success",
          confirmButtonColor: "#10b981",
        });

        // Limpiar campos sensibles
        setForm((f) => ({
          ...f,
          password: "",
          numeroTarjeta: "",
          fechaVencimiento: f.fechaVencimiento || "",
        }));

        // Recargar datos actualizados
        obtenerPerfil(form.usuarioID);
      }
    }
  };

  const handleCancel = async () => {
    // Verificar si hay cambios sin guardar
    const hasChanges =
      form.nombre !== perfil?.nombre ||
      form.apellidoPaterno !== perfil?.apellidoPaterno ||
      form.apellidoMaterno !== perfil?.apellidoMaterno ||
      form.telefono !== perfil?.telefono ||
      form.email !== perfil?.email ||
      form.calle !== perfil?.calle ||
      form.numeroCasa !== perfil?.numeroCasa ||
      form.fechaNacimiento !==
        (perfil?.fechaNacimiento?.substring(0, 10) || "") ||
      form.fechaVencimiento !== perfil?.fechaVencimiento ||
      form.password ||
      form.numeroTarjeta;

    if (hasChanges) {
      const result = await Swal.fire({
        title: "¿Descartar cambios?",
        text: "Tienes cambios sin guardar. ¿Seguro que quieres salir?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, descartar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        navigate(-1);
      }
    } else {
      navigate(-1);
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
                disabled={saving}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:opacity-60"
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
                disabled={saving}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:opacity-60"
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
                disabled={saving}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:opacity-60"
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
                disabled={saving}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:opacity-60"
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
                disabled={saving}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:opacity-60"
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
                disabled={saving}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:opacity-60"
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
                disabled={saving}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:opacity-60"
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
                disabled={saving}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:opacity-60"
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
                disabled={saving}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:opacity-60"
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
                disabled={saving}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:opacity-60"
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
                disabled={saving}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition disabled:opacity-60"
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
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
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
