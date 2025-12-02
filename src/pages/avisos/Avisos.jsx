// src/pages/avisos/Avisos.jsx
import { useEffect, useState, useCallback, useContext, useMemo } from "react";
import AvisosContext from "@/context/Avisos/AvisosContext";
import AvisosList from "./AvisosList";
import AvisoForm from "./AvisoForm";
import AvisosFilters from "@/pages/avisos/AvisosFilters";

export default function Avisos() {
  const {
    avisos,
    categorias,
    loading,
    error,
    getAvisos,
    getCategoriasAviso,
    crearAviso,
    actualizarAviso,
    eliminarAviso,
    clearError,
  } = useContext(AvisosContext);

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    orden: "recientes",
    q: "",
    categoriaId: null,
    fechaDesde: "",
    fechaHasta: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // -------- PRIORIDAD DE CATEGORÍAS --------
  const catPriority = useCallback(
    (catId) => {
      const c = categorias.find((x) => x.categoriaID === catId);
      if (c?.prioridad != null) return Number(c.prioridad);

      const n = (c?.nombre || "").toLowerCase();
      if (n.includes("alerta")) return 1;
      if (n.includes("evento")) return 2;
      return 3;
    },
    [categorias]
  );

  // -------- FUNCIÓN PARA PARSEAR FECHAS DE FORMA SEGURA --------
  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? null : d;
  };

  // -------- FILTROS + ORDEN + PAGINACIÓN --------
  const data = useMemo(() => {
    let arr = [...(avisos || [])];

    // Filtro por búsqueda
    if (query.q?.trim()) {
      const q = query.q.toLowerCase();
      arr = arr.filter(
        (a) =>
          a.titulo?.toLowerCase().includes(q) ||
          a.descripcion?.toLowerCase().includes(q)
      );
    }

    // Filtro por categoría
    if (query.categoriaId) {
      arr = arr.filter(
        (a) => Number(a.categoriaID) === Number(query.categoriaId)
      );
    }

    // Filtro por rango de fechas
    if (query.fechaDesde) {
      const desde = parseDate(query.fechaDesde);
      if (desde) {
        arr = arr.filter((a) => {
          const fechaAviso = parseDate(a.fechaPublicacion);
          return fechaAviso && fechaAviso >= desde;
        });
      }
    }

    if (query.fechaHasta) {
      const hasta = parseDate(query.fechaHasta);
      if (hasta) {
        hasta.setHours(23, 59, 59, 999); // Incluir todo el día
        arr = arr.filter((a) => {
          const fechaAviso = parseDate(a.fechaPublicacion);
          return fechaAviso && fechaAviso <= hasta;
        });
      }
    }

    // Ordenamiento (usando fechaEvento porque fechaPublicacion es la misma para todos)
    if (query.orden === "prioridad") {
      arr.sort((a, b) => {
        const prioA = catPriority(a.categoriaID);
        const prioB = catPriority(b.categoriaID);

        if (prioA !== prioB) return prioA - prioB;

        // Si tienen la misma prioridad, ordenar por fecha de evento
        const fechaA = parseDate(a.fechaEvento);
        const fechaB = parseDate(b.fechaEvento);

        if (!fechaA && !fechaB) return 0;
        if (!fechaA) return 1;
        if (!fechaB) return -1;

        return fechaB - fechaA; // Más reciente primero
      });
    } else if (query.orden === "antiguos") {
      // Más antiguos primero (por fecha de evento)
      arr.sort((a, b) => {
        const fechaA = parseDate(a.fechaEvento);
        const fechaB = parseDate(b.fechaEvento);

        if (!fechaA && !fechaB) return 0;
        if (!fechaA) return 1;
        if (!fechaB) return -1;

        return fechaA - fechaB;
      });
    } else {
      // recientes (default) - Más reciente primero (por fecha de evento)
      arr.sort((a, b) => {
        const fechaA = parseDate(a.fechaEvento);
        const fechaB = parseDate(b.fechaEvento);

        if (!fechaA && !fechaB) return 0;
        if (!fechaA) return 1;
        if (!fechaB) return -1;

        return fechaB - fechaA;
      });
    }

    const total = arr.length;
    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;

    return {
      items: arr.slice(start, end),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }, [avisos, categorias, query, catPriority]);

  // -------- CARGA INICIAL --------
  useEffect(() => {
    getCategoriasAviso();
    getAvisos();
  }, []);

  // -------- ACCIONES --------
  const onSubmitForm = async (values) => {
    const ok = editing
      ? await actualizarAviso({ ...values, avisoID: editing.avisoID })
      : await crearAviso(values);

    if (ok) {
      alert(editing ? "Aviso actualizado" : "Aviso creado");
      setShowForm(false);
      setEditing(null);
    }
  };

  const onDelete = async (item) => {
    if (!confirm(`¿Eliminar el aviso "${item.titulo}"?`)) return;
    const ok = await eliminarAviso(item.avisoID);
    if (ok) alert("Aviso eliminado");
  };

  const catMap = useMemo(
    () =>
      categorias.reduce((acc, c) => {
        acc[c.categoriaID] = c.nombre;
        return acc;
      }, {}),
    [categorias]
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avisos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona los avisos y notificaciones del sistema
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition font-medium shadow-sm hover:shadow"
        >
          + Nuevo aviso
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 flex justify-between items-center">
          <span className="text-sm">{error}</span>
          <button
            onClick={clearError}
            className="text-rose-400 hover:text-rose-600 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filtros */}
      <AvisosFilters
        query={query}
        setQuery={setQuery}
        categorias={categorias}
      />

      {/* Contador de resultados */}
      <div className="mb-4 text-sm text-gray-600">
        Mostrando <span className="font-semibold">{data.items.length}</span> de{" "}
        <span className="font-semibold">{data.total}</span> avisos
      </div>

      {/* Lista de Avisos */}
      <AvisosList
        loading={loading}
        error={error}
        data={data}
        onEdit={(item) => {
          setEditing(item);
          setShowForm(true);
        }}
        onDelete={onDelete}
        onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
        catMap={catMap}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <AvisoForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={onSubmitForm}
          categorias={categorias}
          initial={editing}
        />
      )}
    </div>
  );
}
