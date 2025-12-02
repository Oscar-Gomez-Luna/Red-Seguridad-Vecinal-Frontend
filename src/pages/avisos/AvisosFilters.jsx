import { Search, Filter, X } from "lucide-react";

export default function AvisosFilters({ query, setQuery, categorias }) {
  const handleClearFilters = () => {
    setQuery({
      page: 1,
      pageSize: 10,
      orden: "recientes",
      q: "",
      categoriaId: null,
      fechaDesde: "",
      fechaHasta: "",
    });
  };

  const hasActiveFilters =
    query.q?.trim() ||
    query.categoriaId ||
    query.fechaDesde ||
    query.fechaHasta ||
    query.orden !== "recientes";

  return (
    <div className="mb-6 space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por título o descripción..."
          value={query.q || ""}
          onChange={(e) =>
            setQuery((q) => ({ ...q, q: e.target.value, page: 1 }))
          }
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
        />
      </div>

      {/* Filtros avanzados */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="ml-auto text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Categoría
            </label>
            <select
              value={query.categoriaId || ""}
              onChange={(e) =>
                setQuery((q) => ({
                  ...q,
                  categoriaId: e.target.value || null,
                  page: 1,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.categoriaID} value={cat.categoriaID}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Orden */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ordenar por
            </label>
            <select
              value={query.orden || "recientes"}
              onChange={(e) =>
                setQuery((q) => ({ ...q, orden: e.target.value, page: 1 }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="prioridad">Por prioridad</option>
            </select>
          </div>

          {/* Fecha desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Desde
            </label>
            <input
              type="date"
              value={query.fechaDesde || ""}
              onChange={(e) =>
                setQuery((q) => ({ ...q, fechaDesde: e.target.value, page: 1 }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Hasta
            </label>
            <input
              type="date"
              value={query.fechaHasta || ""}
              onChange={(e) =>
                setQuery((q) => ({ ...q, fechaHasta: e.target.value, page: 1 }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            />
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
          {hasActiveFilters && (
            <span className="font-medium">Filtros activos aplicados</span>
          )}
        </div>
      </div>
    </div>
  );
}