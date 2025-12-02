import React, { useState, useEffect, useContext } from "react";
import ReportesContext from "../context/Reportes/ReportesContext";

const CategoriaSeleccionModal = ({ open, onClose, reporte, onConfirm }) => {
  const { categoriasAviso, fetchCategoriasAviso, loading } = useContext(ReportesContext);
  const [selectedCategoriaID, setSelectedCategoriaID] = useState("");

  // Cargar categorías cuando se abre
  useEffect(() => {
    if (open) {
      fetchCategoriasAviso();
    }
  }, [open]);

  // Seleccionar primera categoría por defecto
  useEffect(() => {
    if (open && categoriasAviso.length > 0 && !selectedCategoriaID) {
      const primeraCategoria = categoriasAviso[0];
      setSelectedCategoriaID(String(primeraCategoria?.CategoriaID || primeraCategoria?.categoriaID || "1"));
    }
  }, [open, categoriasAviso]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategoriaID) {
      alert("Por favor selecciona una categoría");
      return;
    }
    
    try {
      await onConfirm(Number(selectedCategoriaID));
      onClose();
    } catch (error) {
      console.error("Error al confirmar:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            Seleccionar Categoría del Aviso
          </h2>
          {reporte && (
            <p className="text-sm text-slate-600 mt-1">
              Reporte: <strong>"{reporte.titulo}"</strong> (ID: {reporte.reporteID})
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Categoría del aviso *
            </label>
            <select
              value={selectedCategoriaID}
              onChange={(e) => setSelectedCategoriaID(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={categoriasAviso.length === 0}
            >
              {categoriasAviso.length === 0 ? (
                <option>Cargando categorías...</option>
              ) : (
                <>
                  <option value="">Selecciona una categoría</option>
                  {categoriasAviso.map((cat) => (
                    <option 
                      key={cat.CategoriaID || cat.categoriaID} 
                      value={String(cat.CategoriaID || cat.categoriaID)}
                    >
                      {cat.Nombre || cat.nombre}
                    </option>
                  ))}
                </>
              )}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Esta categoría se usará para el aviso que se creará automáticamente.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || categoriasAviso.length === 0}
              className="px-4 py-2 text-sm rounded-lg border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {loading ? "Procesando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoriaSeleccionModal;