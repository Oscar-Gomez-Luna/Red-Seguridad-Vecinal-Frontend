import { useEffect, useState, useContext } from "react";
import { useAuth } from "@/context/AuthContext";
import UsuariosContext from "@/context/Usuarios/UsuariosContext";
import UsuarioForm from "./UsuarioForm";

export default function UsuariosList() {
  const { user: authUser } = useAuth(); // Obtener usuario logueado

  const {
    usuarios,
    tiposUsuario: tipos,
    usuarioSeleccionado,
    error,
    loading,
    saving,
    listarUsuarios,
    obtenerUsuario,
    registrarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    reactivarUsuario,
    obtenerTiposUsuario,
    clearError,
  } = useContext(UsuariosContext);

  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const loadData = async () => {
    clearError();
    try {
      await Promise.all([listarUsuarios(), obtenerTiposUsuario()]);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNew = () => {
    setEditing({});
  };

  const handleEdit = async (u) => {
    try {
      await obtenerUsuario(u.usuarioID);
    } catch (err) {
      console.error("Error obteniendo detalle de usuario:", err);
    }
  };

  useEffect(() => {
    if (usuarioSeleccionado) {
      if (!editing || editing.usuarioID === usuarioSeleccionado.usuarioID) {
        setEditing(usuarioSeleccionado);
      }
    }
  }, [usuarioSeleccionado]);

  const handleDelete = async (u) => {
    if (
      !window.confirm(
        `¿Desactivar al usuario "${u.nombre} ${u.apellidoPaterno}"?`
      )
    ) {
      return;
    }
    try {
      await eliminarUsuario(u.usuarioID);
      await listarUsuarios();
    } catch (err) {
      console.error("Error eliminando usuario:", err);
    }
  };

  const handleReactivate = async (u) => {
    if (
      !window.confirm(
        `¿Reactivar al usuario "${u.nombre} ${u.apellidoPaterno}"?`
      )
    ) {
      return;
    }
    try {
      await reactivarUsuario(u.usuarioID);
      await listarUsuarios();
    } catch (err) {
      console.error("Error reactivando usuario:", err);
    }
  };

  const handleCancelForm = () => {
    setEditing(null);
  };

  const handleSubmitForm = async (formData) => {
    clearError();
    try {
      if (formData.usuarioID) {
        const updateData = {
          usuarioID: formData.usuarioID,
          numeroCasa: formData.numeroCasa || "",
          calle: formData.calle || "",
          nombre: formData.nombre || "",
          apellidoPaterno: formData.apellidoPaterno || "",
          apellidoMaterno: formData.apellidoMaterno || "",
          telefono: formData.telefono || "",
          fechaNacimiento: formData.fechaNacimiento || null,
          email: formData.email || "",
          password: formData.password || "",
          fechaVencimiento: formData.fechaVencimiento || "",
        };

        if (formData.numeroTarjeta && formData.numeroTarjeta.trim() !== "") {
          updateData.numeroTarjeta = formData.numeroTarjeta;
          updateData.ultimosDigitos = formData.numeroTarjeta?.slice(-4) || "";
        } else {
          updateData.numeroTarjeta = "";
          updateData.ultimosDigitos = "";
        }

        await actualizarUsuario(updateData);
        location.reload();
      } else {
        const usuarioData = {
          tipoUsuarioID: parseInt(formData.tipoUsuarioID) || 1,
          numeroCasa: formData.numeroCasa || "",
          calle: formData.calle || "",
          nombre: formData.nombre || "",
          apellidoPaterno: formData.apellidoPaterno || "",
          apellidoMaterno: formData.apellidoMaterno || "",
          telefono: formData.telefono || "",
          fechaNacimiento: formData.fechaNacimiento || null,
          email: formData.email || "",
          password: formData.password || "Vecinal123!",
          numeroTarjeta: formData.numeroTarjeta || "",
          fechaVencimiento: formData.fechaVencimiento || "",
        };

        await registrarUsuario(usuarioData);
      }

      await listarUsuarios();
      setEditing(null);
    } catch (err) {
      console.error("Error guardando usuario:", err);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    // Excluir usuario logueado
    const userLoggedId = authUser?.id || authUser?.usuarioID;
    if (userLoggedId && u.usuarioID === userLoggedId) {
      return false;
    }

    // Filtro de búsqueda
    const term = search.trim().toLowerCase();
    if (term) {
      const fullText = (
        (u.nombre || "") +
        " " +
        (u.apellidoPaterno || "") +
        " " +
        (u.apellidoMaterno || "") +
        " " +
        (u.email || "") +
        " " +
        (u.calle || "") +
        " " +
        (u.numeroCasa || "")
      )
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const normalizedTerm = term
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (!fullText.includes(normalizedTerm)) return false;
    }

    // Filtro por tipo
    if (filtroTipo) {
      const tipoUsuario = (u.tipoUsuario || "").toLowerCase().trim();
      const filtro = filtroTipo.toLowerCase().trim();

      if (tipoUsuario !== filtro) return false;
    }

    // Filtro por estado
    if (filtroEstado === "activos" && !u.activo) return false;
    if (filtroEstado === "inactivos" && u.activo) return false;

    return true;
  });

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-slate-500">
          Administra administradores, residentes y personal de seguridad.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex flex-1 flex-wrap gap-2 min-w-[260px]">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o correo..."
            className="flex-1 min-w-[180px] border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border rounded-full px-3 py-2 text-sm min-w-[140px]"
          >
            <option value="">Todos los tipos</option>
            {tipos.map((t) => (
              <option key={t.tipoUsuarioID} value={t.nombre}>
                {t.nombre}
              </option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border rounded-full px-3 py-2 text-sm min-w-[140px]"
          >
            <option value="">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleNew}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
        >
          + Nuevo usuario
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-slate-500">Cargando...</div>
      ) : (
        <>
          {editing && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {editing.usuarioID ? "Editar usuario" : "Nuevo usuario"}
              </h2>
              <UsuarioForm
                initial={editing.usuarioID ? editing : null}
                tipos={tipos}
                saving={saving}
                onCancel={handleCancelForm}
                onSubmit={handleSubmitForm}
              />
            </div>
          )}

          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Nombre
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Correo
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Tipo
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      No hay usuarios que coincidan con el filtro.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => {
                    const tipoLabel = u.tipoUsuario || "Sin tipo";

                    return (
                      <tr
                        key={u.usuarioID}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-2">
                          {u.nombre} {u.apellidoPaterno}
                        </td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{tipoLabel}</td>
                        <td className="px-4 py-2">
                          {u.activo ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(u)}
                            className="px-3 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                          >
                            Editar
                          </button>

                          {u.activo ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(u)}
                              className="px-3 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                            >
                              Eliminar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleReactivate(u)}
                              className="px-3 py-1 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600"
                            >
                              Reactivar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
