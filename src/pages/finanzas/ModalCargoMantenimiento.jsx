// components/cargos/ModalCargoMantenimiento.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

const ModalCargoMantenimiento = ({ isOpen, onClose, cargoExistente = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    usuarioID: '',
    personalMantenimientoID: '',
    concepto: '',
    monto: '',
    fechaVencimiento: '',
    notas: ''
  });
  
  const [usuarios, setUsuarios] = useState([]);
  const [personalMantenimiento, setPersonalMantenimiento] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      cargarUsuarios();
      cargarPersonalMantenimiento();
      
      // Si estamos editando, prellenar el formulario
      if (cargoExistente) {
        console.log('Cargo recibido para editar en modal:', cargoExistente);
        
        // Función helper para convertir valores a string o string vacío
        const safeString = (value) => {
          if (value === null || value === undefined || value === '') return '';
          return String(value);
        };
        
        // Asegurar que los valores sean strings (o string vacío si son null/undefined)
        setFormData({
          usuarioID: safeString(cargoExistente.usuarioID),
          personalMantenimientoID: safeString(cargoExistente.personalMantenimientoID),
          concepto: cargoExistente.concepto || '',
          monto: cargoExistente.monto?.toString() || '',
          fechaVencimiento: cargoExistente.fechaVencimiento ? 
            new Date(cargoExistente.fechaVencimiento).toISOString().split('T')[0] : '',
          notas: cargoExistente.notas || ''
        });
        
        console.log('FormData inicializado en modal:', {
          usuarioID: safeString(cargoExistente.usuarioID),
          personalMantenimientoID: safeString(cargoExistente.personalMantenimientoID),
          concepto: cargoExistente.concepto,
          monto: cargoExistente.monto
        });
      } else {
        // Si es nuevo, limpiar formulario
        setFormData({
          usuarioID: '',
          personalMantenimientoID: '',
          concepto: '',
          monto: '',
          fechaVencimiento: '',
          notas: ''
        });
      }
      
      setError('');
      setSuccess('');
    }
  }, [isOpen, cargoExistente]);

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get(`${API}/Usuarios`);
      setUsuarios(res.data);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  const cargarPersonalMantenimiento = async () => {
    try {
      const res = await axios.get(`${API}/Servicios/personal-mantenimiento`);
      setPersonalMantenimiento(res.data);
    } catch (err) {
      console.error('Error cargando personal:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validaciones básicas
    if (!formData.concepto.trim()) {
      setError('El concepto es requerido');
      setLoading(false);
      return;
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      setError('El monto debe ser mayor a 0');
      setLoading(false);
      return;
    }

    try {
      // Construir payload - IMPORTANTE: manejar strings vacíos como null
      const payload = {
        usuarioID: formData.usuarioID && formData.usuarioID.trim() !== '' ? parseInt(formData.usuarioID) : null,
        personalMantenimientoID: formData.personalMantenimientoID && formData.personalMantenimientoID.trim() !== '' ? parseInt(formData.personalMantenimientoID) : null,
        concepto: formData.concepto,
        monto: parseFloat(formData.monto),
        fechaVencimiento: formData.fechaVencimiento && formData.fechaVencimiento.trim() !== '' ? formData.fechaVencimiento : null,
        notas: formData.notas || ''
      };

      console.log('Enviando payload al backend:', payload);

      if (cargoExistente) {
        // Actualizar cargo existente
        const response = await axios.put(
          `${API}/Servicios/cargos/mantenimiento/${cargoExistente.cargoMantenimientoID}`,
          payload
        );
        console.log('Respuesta de actualización:', response.data);
        setSuccess('Cargo actualizado exitosamente');
      } else {
        // Crear nuevo cargo
        const response = await axios.post(
          `${API}/Servicios/cargos/mantenimiento`,
          payload
        );
        console.log('Respuesta de creación:', response.data);
        setSuccess('Cargo creado exitosamente');
      }

      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error al guardar cargo:', err);
      console.error('Respuesta del error:', err.response?.data);
      setError(err.response?.data?.message || 'Error al guardar el cargo');
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
              {cargoExistente ? 'Editar Cargo de Mantenimiento' : 'Agregar Cargo de Mantenimiento'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            {cargoExistente 
              ? `ID: #${cargoExistente.cargoMantenimientoID}`
              : 'Complete el formulario para crear un nuevo cargo'}
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
                  {usuarios.map(usuario => (
                    <option key={usuario.usuarioID} value={usuario.usuarioID}>
                      {usuario.nombre} {usuario.apellidoPaterno} {usuario.apellidoMaterno}
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
                  {personalMantenimiento.map(personal => (
                    <option key={personal.personalMantenimientoID} value={personal.personalMantenimientoID}>
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
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
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
                onClick={onClose}
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
                {loading ? 'Guardando...' : (cargoExistente ? 'Actualizar Cargo' : 'Crear Cargo')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalCargoMantenimiento;