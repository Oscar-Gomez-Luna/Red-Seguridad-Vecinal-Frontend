// components/cargos/ModalCargoMantenimiento.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API = import.meta.env.VITE_API_BASE_URL;

const ModalCargoMantenimiento = ({
  isOpen,
  onClose,
  cargoExistente = null,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    usuarioID: "",
    personalMantenimientoID: "",
    concepto: "",
    monto: "",
    fechaVencimiento: "",
    notas: "",
  });

  const [usuarios, setUsuarios] = useState([]);
  const [personalMantenimiento, setPersonalMantenimiento] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cargar datos iniciales y reiniciar estados
  useEffect(() => {
    if (isOpen) {
      // REINICIAR ESTADOS CADA VEZ QUE SE ABRE EL MODAL
      setLoading(false); // <- ESTO ES CLAVE
      setError("");
      setSuccess("");

      cargarUsuarios();
      cargarPersonalMantenimiento();

      if (cargoExistente) {
        console.log("Cargo recibido para editar en modal:", cargoExistente);

        const safeString = (value) => {
          if (value === null || value === undefined || value === "") return "";
          return String(value);
        };

        setFormData({
          usuarioID: safeString(cargoExistente.usuarioID),
          personalMantenimientoID: safeString(
            cargoExistente.personalMantenimientoID
          ),
          concepto: cargoExistente.concepto || "",
          monto: cargoExistente.monto?.toString() || "",
          fechaVencimiento: cargoExistente.fechaVencimiento
            ? new Date(cargoExistente.fechaVencimiento)
                .toISOString()
                .split("T")[0]
            : "",
          notas: cargoExistente.notas || "",
        });

        console.log("FormData inicializado en modal:", {
          usuarioID: safeString(cargoExistente.usuarioID),
          personalMantenimientoID: safeString(
            cargoExistente.personalMantenimientoID
          ),
          concepto: cargoExistente.concepto,
          monto: cargoExistente.monto,
        });
      } else {
        // Si es nuevo, limpiar formulario
        setFormData({
          usuarioID: "",
          personalMantenimientoID: "",
          concepto: "",
          monto: "",
          fechaVencimiento: "",
          notas: "",
        });
      }
    }
  }, [isOpen, cargoExistente]);

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get(`${API}/Usuarios`);

      // Filtrar solo usuarios con tipo "Usuario" o "Admin"
      const usuariosFiltrados = res.data.filter((usuario) => {
        const tipoUsuario = (usuario.tipoUsuario || "").toLowerCase();
        return tipoUsuario === "usuario" || tipoUsuario === "admin";
      });

      console.log(
        "Usuarios filtrados (Usuario/Admin):",
        usuariosFiltrados.length,
        "de",
        res.data.length
      );
      setUsuarios(usuariosFiltrados);

      if (usuariosFiltrados.length === 0) {
        console.warn('No se encontraron usuarios con tipo "Usuario" o "Admin"');
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      await Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los usuarios. Por favor, intenta nuevamente.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const cargarPersonalMantenimiento = async () => {
    try {
      const res = await axios.get(`${API}/Servicios/personal-mantenimiento`);
      setPersonalMantenimiento(res.data);
    } catch (err) {
      console.error("Error cargando personal:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = async () => {
    // Verificar si hay cambios sin guardar
    const hasChanges =
      formData.usuarioID !== (cargoExistente?.usuarioID?.toString() || "") ||
      formData.personalMantenimientoID !==
        (cargoExistente?.personalMantenimientoID?.toString() || "") ||
      formData.concepto !== (cargoExistente?.concepto || "") ||
      formData.monto !== (cargoExistente?.monto?.toString() || "") ||
      formData.fechaVencimiento !==
        (cargoExistente?.fechaVencimiento
          ? new Date(cargoExistente.fechaVencimiento)
              .toISOString()
              .split("T")[0]
          : "") ||
      formData.notas !== (cargoExistente?.notas || "");

    if (hasChanges) {
      const result = await Swal.fire({
        title: "¿Descartar cambios?",
        text: "Tienes cambios sin guardar. ¿Seguro que quieres cancelar?",
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validaciones básicas
    if (!formData.concepto.trim()) {
      setError("El concepto es requerido");
      setLoading(false);

      await Swal.fire({
        title: "Campo requerido",
        text: "El concepto es obligatorio",
        icon: "warning",
        confirmButtonColor: "#10b981",
      });
      return;
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      setError("El monto debe ser mayor a 0");
      setLoading(false);

      await Swal.fire({
        title: "Monto inválido",
        text: "El monto debe ser mayor a 0",
        icon: "warning",
        confirmButtonColor: "#10b981",
      });
      return;
    }

    try {
      // Construir payload - IMPORTANTE: manejar strings vacíos como null
      const payload = {
        usuarioID:
          formData.usuarioID && formData.usuarioID.trim() !== ""
            ? parseInt(formData.usuarioID)
            : null,
        personalMantenimientoID:
          formData.personalMantenimientoID &&
          formData.personalMantenimientoID.trim() !== ""
            ? parseInt(formData.personalMantenimientoID)
            : null,
        concepto: formData.concepto,
        monto: parseFloat(formData.monto),
        fechaVencimiento:
          formData.fechaVencimiento && formData.fechaVencimiento.trim() !== ""
            ? formData.fechaVencimiento
            : null,
        notas: formData.notas || "",
      };

      console.log("Enviando payload al backend:", payload);

      // Mostrar confirmación con SweetAlert
      const actionText = cargoExistente ? "actualizar" : "crear";
      const usuarioSeleccionado = usuarios.find(
        (u) => u.usuarioID === parseInt(formData.usuarioID)
      );
      const personalSeleccionado = personalMantenimiento.find(
        (p) =>
          p.personalMantenimientoID ===
          parseInt(formData.personalMantenimientoID)
      );

      const result = await Swal.fire({
        title: `¿${cargoExistente ? "Actualizar" : "Crear"} cargo?`,
        html: `
          <div class="text-left space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-semibold">Concepto:</span>
              <span>${formData.concepto}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-semibold">Monto:</span>
              <span>$${parseFloat(formData.monto).toFixed(2)}</span>
            </div>
            ${
              usuarioSeleccionado
                ? `
            <div class="flex items-center justify-between">
              <span class="font-semibold">Usuario:</span>
              <span>${usuarioSeleccionado.nombre} ${usuarioSeleccionado.apellidoPaterno}</span>
            </div>
            `
                : ""
            }
            ${
              personalSeleccionado
                ? `
            <div class="flex items-center justify-between">
              <span class="font-semibold">Personal:</span>
              <span>${personalSeleccionado.nombrePersona} (${personalSeleccionado.puesto})</span>
            </div>
            `
                : ""
            }
            ${
              formData.fechaVencimiento
                ? `
            <div class="flex items-center justify-between">
              <span class="font-semibold">Vencimiento:</span>
              <span>${new Date(
                formData.fechaVencimiento
              ).toLocaleDateString()}</span>
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
        confirmButtonText: `Sí, ${actionText}`,
        cancelButtonText: "Cancelar",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            if (cargoExistente) {
              // Actualizar cargo existente
              const response = await axios.put(
                `${API}/Servicios/cargos/mantenimiento/${cargoExistente.cargoMantenimientoID}`,
                payload
              );
              console.log("Respuesta de actualización:", response.data);
              return response.data;
            } else {
              // Crear nuevo cargo
              const response = await axios.post(
                `${API}/Servicios/cargos/mantenimiento`,
                payload
              );
              console.log("Respuesta de creación:", response.data);
              return response.data;
            }
          } catch (err) {
            Swal.showValidationMessage(
              `Error: ${
                err.response?.data?.message ||
                err.message ||
                "No se pudo guardar el cargo"
              }`
            );
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

      if (result.isConfirmed) {
        await Swal.fire({
          title: "¡Éxito!",
          text: `Cargo ${
            cargoExistente ? "actualizado" : "creado"
          } exitosamente`,
          icon: "success",
          confirmButtonColor: "#10b981",
        });

        // Asegurar que loading se ponga en false antes de cerrar
        setLoading(false);

        // Esperar un momento para mostrar el mensaje de éxito
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1000);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error al guardar cargo:", err);
      console.error("Respuesta del error:", err.response?.data);

      await Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Error al guardar el cargo",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });

      setError(err.response?.data?.message || "Error al guardar el cargo");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {cargoExistente
                ? "Editar Cargo de Mantenimiento"
                : "Agregar Cargo de Mantenimiento"}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={loading}
            >
              &times;
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            {cargoExistente
              ? `ID: #${cargoExistente.cargoMantenimientoID}`
              : "Complete el formulario para crear un nuevo cargo"}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario (Opcional)
                </label>
                <select
                  name="usuarioID"
                  value={formData.usuarioID}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Seleccionar usuario (opcional)</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.usuarioID} value={usuario.usuarioID}>
                      {usuario.nombre} {usuario.apellidoPaterno}{" "}
                      {usuario.apellidoMaterno}
                      {usuario.tipoUsuario && ` - ${usuario.tipoUsuario}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal de Mantenimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal (Opcional)
                </label>
                <select
                  name="personalMantenimientoID"
                  value={formData.personalMantenimientoID}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Seleccionar personal (opcional)</option>
                  {personalMantenimiento.map((personal) => (
                    <option
                      key={personal.personalMantenimientoID}
                      value={personal.personalMantenimientoID}
                    >
                      {personal.nombrePersona} - {personal.puesto}
                    </option>
                  ))}
                </select>
              </div>

              {/* Concepto */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concepto *
                </label>
                <input
                  type="text"
                  name="concepto"
                  value={formData.concepto}
                  onChange={handleChange}
                  placeholder="Ej. Mantenimiento mensual, Reparación de fuga, etc."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full rounded-md border border-gray-300 pl-7 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Fecha de Vencimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento (Opcional)
                </label>
                <input
                  type="date"
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {/* Notas */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (Opcional)
                </label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Detalles adicionales sobre el cargo..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Guardando...
                  </>
                ) : cargoExistente ? (
                  "Actualizar Cargo"
                ) : (
                  "Crear Cargo"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalCargoMantenimiento;
