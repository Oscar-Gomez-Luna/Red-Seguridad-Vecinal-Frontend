// src/context/Estadisticas/EstadisticasState.jsx
import { useReducer } from "react";
import axios from "axios";
import EstadisticasContext from "./EstadisticasContext";
import EstadisticasReducer from "./EstadisticasReducer";
import { ESTADISTICAS_ACTIONS } from "./ActionsTypes";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5165/api";

const EstadisticasState = ({ children }) => {
  const initialState = {
    incidentes: null,
    pagos: null,
    servicios: null,
    pdfUrl: null,
    error: null,
    loading: false,
  };

  const [state, dispatch] = useReducer(EstadisticasReducer, initialState);

  // Obtener estadísticas de incidentes/reportes
  const getEstadisticasIncidentes = async () => {
    dispatch({ type: ESTADISTICAS_ACTIONS.LOADING });
    try {
      const res = await axios.get(`${API_URL}/Estadisticas/incidentes`);
      dispatch({
        type: ESTADISTICAS_ACTIONS.GET_INCIDENTES,
        payload: res.data,
      });
      return { success: true, data: res.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar estadísticas de incidentes";
      dispatch({
        type: ESTADISTICAS_ACTIONS.ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Obtener estadísticas de pagos
  const getEstadisticasPagos = async () => {
    dispatch({ type: ESTADISTICAS_ACTIONS.LOADING });
    try {
      const res = await axios.get(`${API_URL}/Estadisticas/pagos`);
      dispatch({
        type: ESTADISTICAS_ACTIONS.GET_PAGOS,
        payload: res.data,
      });
      return { success: true, data: res.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar estadísticas de pagos";
      dispatch({
        type: ESTADISTICAS_ACTIONS.ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Obtener estadísticas de servicios
  const getEstadisticasServicios = async () => {
    dispatch({ type: ESTADISTICAS_ACTIONS.LOADING });
    try {
      const res = await axios.get(`${API_URL}/Estadisticas/servicios`);
      dispatch({
        type: ESTADISTICAS_ACTIONS.GET_SERVICIOS,
        payload: res.data,
      });
      return { success: true, data: res.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar estadísticas de servicios";
      dispatch({
        type: ESTADISTICAS_ACTIONS.ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Exportar estadísticas a PDF
  const exportarEstadisticas = async () => {
    dispatch({ type: ESTADISTICAS_ACTIONS.LOADING });
    try {
      const res = await axios.get(`${API_URL}/Estadisticas/exportar`, {
        responseType: "blob", // Importante para archivos
      });

      // Crear URL del blob para descargar
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Descargar automáticamente
      const link = document.createElement("a");
      link.href = url;
      link.download = `estadisticas_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar URL del blob
      window.URL.revokeObjectURL(url);

      dispatch({
        type: ESTADISTICAS_ACTIONS.EXPORTAR_PDF,
        payload: url,
      });

      return { success: true, url };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al exportar estadísticas";
      dispatch({
        type: ESTADISTICAS_ACTIONS.ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Cargar todas las estadísticas de una vez
  const cargarTodasEstadisticas = async () => {
    dispatch({ type: ESTADISTICAS_ACTIONS.LOADING });
    try {
      const [incidentes, pagos, servicios] = await Promise.all([
        axios.get(`${API_URL}/Estadisticas/incidentes`),
        axios.get(`${API_URL}/Estadisticas/pagos`),
        axios.get(`${API_URL}/Estadisticas/servicios`),
      ]);

      dispatch({
        type: ESTADISTICAS_ACTIONS.GET_INCIDENTES,
        payload: incidentes.data,
      });
      dispatch({
        type: ESTADISTICAS_ACTIONS.GET_PAGOS,
        payload: pagos.data,
      });
      dispatch({
        type: ESTADISTICAS_ACTIONS.GET_SERVICIOS,
        payload: servicios.data,
      });

      return {
        success: true,
        data: {
          incidentes: incidentes.data,
          pagos: pagos.data,
          servicios: servicios.data,
        },
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar estadísticas";
      dispatch({
        type: ESTADISTICAS_ACTIONS.ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Limpiar errores
  const clearError = () => {
    dispatch({ type: ESTADISTICAS_ACTIONS.CLEAR_ERROR });
  };

  return (
    <EstadisticasContext.Provider
      value={{
        // Estado
        incidentes: state.incidentes,
        pagos: state.pagos,
        servicios: state.servicios,
        pdfUrl: state.pdfUrl,
        error: state.error,
        loading: state.loading,

        // Funciones
        getEstadisticasIncidentes,
        getEstadisticasPagos,
        getEstadisticasServicios,
        exportarEstadisticas,
        cargarTodasEstadisticas,
        clearError,
      }}
    >
      {children}
    </EstadisticasContext.Provider>
  );
};

export default EstadisticasState;
