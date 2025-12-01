// src/pages/dashboard/Dashboard.jsx
import { useEffect, useContext } from "react";
import EstadisticasContext from "@/context/Estadisticas/EstadisticasContext";
import StatCard from "@/pages/dashboard/StatCard";
import {
  FileText,
  DollarSign,
  Wrench,
  AlertCircle,
  Download,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function Dashboard() {
  const {
    incidentes,
    pagos,
    servicios,
    loading,
    error,
    cargarTodasEstadisticas,
    clearError,
  } = useContext(EstadisticasContext);

  useEffect(() => {
    cargarTodasEstadisticas();
  }, []);

  if (loading && !incidentes && !pagos && !servicios) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header con botón de exportar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Resumen general del sistema</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 flex items-start justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
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

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Reportes"
          value={incidentes?.totalReportes || 0}
          icon={<FileText className="w-8 h-8 text-blue-600" />}
          hint={
            incidentes?.noVistos
              ? `${incidentes.noVistos} sin revisar`
              : "Todos revisados"
          }
        />
        <StatCard
          title="Total Recaudado"
          value={`$${pagos?.totalRecaudado?.toLocaleString() || 0}`}
          icon={<DollarSign className="w-8 h-8 text-emerald-600" />}
          hint={`${pagos?.totalPagos || 0} pagos realizados`}
        />
        <StatCard
          title="Servicios Completados"
          value={servicios?.totalCompletados || 0}
          icon={<Wrench className="w-8 h-8 text-orange-600" />}
          hint={`${servicios?.disponibles || 0} servicios activos`}
        />
        <StatCard
          title="Adeudo Total"
          value={`$${pagos?.adeudoTotal?.toLocaleString() || 0}`}
          icon={<AlertCircle className="w-8 h-8 text-rose-600" />}
          hint="Pendiente de cobro"
        />
      </div>

      {/* Sección de Incidentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de Incidentes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Estado de Reportes
            </h2>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-gray-900">Vistos</span>
              </div>
              <span className="text-xl font-bold text-emerald-700">
                {incidentes?.vistos || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
              <div className="flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-rose-600" />
                <span className="font-medium text-gray-900">No vistos</span>
              </div>
              <span className="text-xl font-bold text-rose-700">
                {incidentes?.noVistos || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Anónimos</span>
              </div>
              <span className="text-xl font-bold text-gray-700">
                {incidentes?.anonimos || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Identificados</span>
              </div>
              <span className="text-xl font-bold text-blue-700">
                {incidentes?.identificados || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Reportes por Tipo */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Reportes por Tipo
            </h2>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          {incidentes?.porTipo && incidentes.porTipo.length > 0 ? (
            <div className="space-y-3">
              {incidentes.porTipo.map((tipo, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="font-medium text-gray-900">{tipo.tipo}</span>
                  <span className="text-lg font-bold text-blue-700">
                    {tipo.cantidad}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No hay reportes registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pagos por Tipo */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pagos por Tipo
            </h2>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          {pagos?.porTipoPago && pagos.porTipoPago.length > 0 ? (
            <div className="space-y-3">
              {pagos.porTipoPago.map((tipo, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{tipo.tipoPago}</p>
                    <p className="text-sm text-gray-600">{tipo.total} pagos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-700">
                      ${tipo.montoTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No hay pagos registrados</p>
            </div>
          )}
        </div>

        {/* Método de Pago */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Método de Pago
            </h2>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          {pagos?.porMetodoPago && pagos.porMetodoPago.length > 0 ? (
            <div className="space-y-3">
              {pagos.porMetodoPago.map((metodo, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900">
                    {metodo.metodo}
                  </span>
                  <span className="text-xl font-bold text-blue-700">
                    {metodo.total}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No hay datos de métodos de pago</p>
            </div>
          )}

          {/* Pagos por Mes */}
          {pagos?.porMes && pagos.porMes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Últimos meses
              </h3>
              {pagos.porMes.map((mes, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm py-2"
                >
                  <span className="text-gray-600">{mes.mes}</span>
                  <span className="font-semibold text-gray-900">
                    ${mes.montoTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección de Servicios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicios por Tipo */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Servicios por Tipo
            </h2>
            <Wrench className="w-5 h-5 text-orange-600" />
          </div>
          {servicios?.porTipo && servicios.porTipo.length > 0 ? (
            <div className="space-y-3">
              {servicios.porTipo.map((tipo, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{tipo.tipo}</p>
                    <p className="text-sm text-gray-600">
                      {tipo.total} servicios
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-700">
                      {tipo.completados}
                    </p>
                    <p className="text-xs text-gray-500">completados</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No hay servicios registrados</p>
            </div>
          )}
        </div>

        {/* Estado de Cargos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Estado de Cargos
            </h2>
            <TrendingDown className="w-5 h-5 text-purple-600" />
          </div>
          {servicios?.totalesCargos && servicios.totalesCargos.length > 0 ? (
            <div className="space-y-3">
              {servicios.totalesCargos.map((cargo, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    cargo.estado === "Pagado" ? "bg-emerald-50" : "bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {cargo.estado === "Pagado" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {cargo.estado}
                      </p>
                      <p className="text-sm text-gray-600">
                        {cargo.total} cargos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        cargo.estado === "Pagado"
                          ? "text-emerald-700"
                          : "text-yellow-700"
                      }`}
                    >
                      ${cargo.montoTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No hay cargos registrados</p>
            </div>
          )}

          {/* Solicitudes por Mes */}
          {servicios?.porMes && servicios.porMes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Solicitudes mensuales
              </h3>
              {servicios.porMes.map((mes, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm py-2"
                >
                  <span className="text-gray-600">{mes.mes}</span>
                  <span className="font-semibold text-gray-900">
                    {mes.totalSolicitudes} solicitudes
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
