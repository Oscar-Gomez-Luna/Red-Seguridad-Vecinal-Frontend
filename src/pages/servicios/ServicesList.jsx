import { useContext, useEffect, useMemo, useState } from "react";
import ServiciosContext from "../../context/Servicios/ServiciosContext";
import ServicioForm from "./ServicioForm";

export default function ServicesList() {
  const {
    catalogo,
    tipos,
    loading,
    error,
    cargarCatalogoServicios,
    cargarTiposServicio,
    crearServicioCatalogo,
    actualizarServicioCatalogo,
    actualizarDisponibilidadServicio,
  } = useContext(ServiciosContext);

  const [busqueda, setBusqueda] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    cargarTiposServicio();
    cargarCatalogoServicios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rowsFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return catalogo || [];
    return (catalogo || []).filter((s) => {
      const tipo = (s.tipoServicioNombre || "").toLowerCase();
      const nombre = (s.nombreEncargado || "").toLowerCase();
      const tel = s.telefono || "";
      const email = (s.email || "").toLowerCase();
      return (
        tipo.includes(q) ||
        nombre.includes(q) ||
        tel.includes(busqueda.trim()) ||
        email.includes(q)
      );
    });
  }, [busqueda, catalogo]);

  const handleNuevo = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEditar = (row) => {
    setEditing(row);
    setOpenForm(true);
  };

  const handleSubmit = async (formData) => {
    if (editing) {
      await actualizarServicioCatalogo(editing.servicioID, formData);
    } else {
      await crearServicioCatalogo(formData);
    }
    setOpenForm(false);
    setEditing(null);
  };

  const handleToggleDisponible = async (row) => {
    await actualizarDisponibilidadServicio(row.servicioID, !row.disponible);
  };

  return (
    <div className="px-6 py-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Catálogo de servicios
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra los proveedores de servicios de mantenimiento, plomería,
            electricidad, limpieza y más.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm border border-slate-200">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por tipo, encargado, teléfono o email"
              className="text-sm outline-none border-none bg-transparent placeholder:text-slate-400 w-64"
            />
            <span className="text-slate-400 text-lg" aria-hidden>
              🔍
            </span>
          </div>
          <button
            type="button"
            onClick={handleNuevo}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 shadow-sm"
          >
            <span className="text-lg" aria-hidden>
              +
            </span>
            <span>Nuevo servicio</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl bg-red-50 border border-red-100 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-emerald-700 text-white text-left">
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Tipo de servicio
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Encargado
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Teléfono
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Email
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Disponible
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Estado
                </th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Cargando servicios...
                  </td>
                </tr>
              )}

              {!loading && rowsFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No se encontraron servicios.
                  </td>
                </tr>
              )}

              {!loading &&
                rowsFiltradas.map((row, idx) => (
                  <tr
                    key={row.servicioID}
                    className={
                      idx % 2 === 0
                        ? "bg-white"
                        : "bg-emerald-50/40 hover:bg-emerald-50"
                    }
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-emerald-900">
                      {row.tipoServicioNombre}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.nombreEncargado}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.telefono}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.email || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          row.disponible
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            row.disponible ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {row.disponible ? "Disponible" : "No disponible"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          row.activo
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {row.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditar(row)}
                          className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 hover:bg-emerald-200"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleDisponible(row)}
                          className="rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 hover:bg-amber-200"
                        >
                          {row.disponible
                            ? "Marcar no disponible"
                            : "Marcar disponible"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <ServicioForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        initial={editing}
        tipos={tipos}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
