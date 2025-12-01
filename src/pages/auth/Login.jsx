import { useAuth } from "@/context/AuthContext";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ShieldAlert } from "lucide-react";

export default function Login() {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState({ message: "", type: "" });
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError({ message: "", type: "" });

    if (!form.email || !form.password) {
      setError({
        message: "Por favor, completa todos los campos",
        type: "VALIDATION",
      });
      return;
    }

    const result = await login(form.email, form.password);

    if (result.success) {
      navigate("/admin/dashboard");
    } else {
      setError({
        message: result.error,
        type: result.errorType,
      });
    }
  };

  return (
    <div className="min-h-screen grid place-items-center font-inter text-ink bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="card w-[360px] sm:w-[420px] shadow-xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full border-4 border-emerald-200 overflow-hidden grid place-items-center bg-white shadow-md">
            <img
              src="/logo/imagen_2025-10-26_192500425-removebg-preview-removebg-preview.png"
              alt="Red de Seguridad Vecinal"
              className="w-full h-full object-contain p-2"
            />
          </div>
          <p className="mt-2 text-emerald-700 font-semibold text-sm">
            Red de Seguridad Vecinal
          </p>
        </div>

        <h1 className="text-[35px] leading-none font-extrabold text-center mb-4">
          Inicia sesión
        </h1>

        {/* Error Messages */}
        {error.message && (
          <div
            className={`mb-4 text-sm rounded-lg px-4 py-3 flex items-start gap-3 ${
              error.type === "ROLE_DENIED"
                ? "text-orange-800 bg-orange-50 border border-orange-200"
                : "text-red-800 bg-red-50 border border-red-200"
            }`}
          >
            {error.type === "ROLE_DENIED" ? (
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium">{error.message}</p>
              {error.type === "ROLE_DENIED" && (
                <p className="text-xs mt-1 text-orange-700">
                  Este sistema es exclusivo para administradores y personal de
                  seguridad.
                </p>
              )}
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="usuario" className="block mb-1 font-medium">
              Correo electrónico
            </label>
            <input
              id="usuario"
              name="usuario"
              type="email"
              placeholder="ejemplo@correo.com"
              className="input"
              autoComplete="username"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              className="input"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
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
                  Verificando...
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 text-sm text-center">
          <span className="text-slate-700">¿Necesitas ayuda?</span>{" "}
          <a href="#" className="help-link hover:underline">
            Soporte técnico
          </a>
        </div>
      </div>
    </div>
  );
}
