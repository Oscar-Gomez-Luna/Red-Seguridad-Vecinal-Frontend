import { useReducer, useState } from "react";
import ReportesContext from "./ReportesContext";
import ReportesReducer, { initialState } from "./ReportesReducer";
import ReportesAPI from "../../services/reportes.api";
import { AvisosAPI } from "../../services/avisos.api";

import {
  GET_REPORTES_REQUEST,
  GET_REPORTES_SUCCESS,
  GET_REPORTES_ERROR,
  GET_REPORTE_REQUEST,
  GET_REPORTE_SUCCESS,
  GET_REPORTE_ERROR,
  GET_REPORTES_USUARIO_SUCCESS,
  GET_TIPOS_REPORTE_SUCCESS,
  CREATE_REPORTE_REQUEST,
  CREATE_REPORTE_SUCCESS,
  CREATE_REPORTE_ERROR,
  MARCAR_VISTO_SUCCESS,
  CREATE_AVISO_REQUEST,
  CREATE_AVISO_SUCCESS,
  CREATE_AVISO_ERROR,
  GET_AVISOS_REQUEST,
  GET_AVISOS_SUCCESS,
  GET_AVISOS_ERROR,
  GET_CATEGORIAS_AVISO_SUCCESS,
  CLEAR_ERROR,
} from "./ActionsTypes";

export default function ReportesState({ children }) {
  const [state, dispatch] = useReducer(ReportesReducer, initialState);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [pendingReporte, setPendingReporte] = useState(null);
  const [selectedCategoriaID, setSelectedCategoriaID] = useState(null);

  // ---------------- ACCIONES PARA REPORTES ----------------
  const clearError = () => dispatch({ type: CLEAR_ERROR });

  const fetchReportes = async () => {
    dispatch({ type: GET_REPORTES_REQUEST });
    try {
      const data = await ReportesAPI.list();
      dispatch({ type: GET_REPORTES_SUCCESS, payload: data });
    } catch (err) {
      console.error(err);
      dispatch({
        type: GET_REPORTES_ERROR,
        payload: err.message || "Error al cargar reportes",
      });
    }
  };

  const fetchReporteById = async (id) => {
    dispatch({ type: GET_REPORTE_REQUEST });
    try {
      const data = await ReportesAPI.getById(id);
      dispatch({ type: GET_REPORTE_SUCCESS, payload: data });
    } catch (err) {
      console.error(err);
      dispatch({
        type: GET_REPORTE_ERROR,
        payload: err.message || "Error al cargar el reporte",
      });
    }
  };

  const fetchReportesByUsuario = async (usuarioId) => {
    dispatch({ type: GET_REPORTES_REQUEST });
    try {
      const data = await ReportesAPI.listByUsuario(usuarioId);
      dispatch({ type: GET_REPORTES_USUARIO_SUCCESS, payload: data });
    } catch (err) {
      console.error(err);
      dispatch({
        type: GET_REPORTES_ERROR,
        payload: err.message || "Error al cargar reportes del usuario",
      });
    }
  };

  const fetchTiposReporte = async () => {
    try {
      const data = await ReportesAPI.tiposReporte();
      dispatch({ type: GET_TIPOS_REPORTE_SUCCESS, payload: data });
    } catch (err) {
      console.error(err);
    }
  };

  const createReporte = async (data) => {
    dispatch({ type: CREATE_REPORTE_REQUEST });
    try {
      const created = await ReportesAPI.create(data);
      dispatch({ type: CREATE_REPORTE_SUCCESS, payload: created });
      return created;
    } catch (err) {
      console.error(err);
      dispatch({
        type: CREATE_REPORTE_ERROR,
        payload: err.message || "Error al crear el reporte",
      });
      throw err;
    }
  };

  const marcarVisto = async (id, visto = true, categoriaID = null) => {
    try {
      await ReportesAPI.marcarVisto(id, visto);
      dispatch({ type: MARCAR_VISTO_SUCCESS, payload: id });

      // Si se marca como atendido (visto = true), crear aviso automáticamente
      if (visto) {
        const reporte =
          state.reportes.find((r) => r.reporteID === id) || state.reporteActual;
        if (reporte) {
          // Pasar la categoríaID si se proporciona
          await crearAvisoDesdeReporte(reporte, categoriaID);
        }
      }

      return true;
    } catch (err) {
      console.error("Error al marcar visto:", err);
      throw err;
    }
  };

  const marcarVistoConCategoria = async (id, categoriaID) => {
    return await marcarVisto(id, true, categoriaID);
  };

  // ---------------- ACCIONES PARA AVISOS ----------------
  const fetchAvisos = async () => {
    dispatch({ type: GET_AVISOS_REQUEST });
    try {
      const data = await AvisosAPI.listRaw();
      dispatch({ type: GET_AVISOS_SUCCESS, payload: data });
    } catch (err) {
      console.error(err);
      dispatch({
        type: GET_AVISOS_ERROR,
        payload: err.message || "Error al cargar avisos",
      });
    }
  };

  const fetchCategoriasAviso = async () => {
    try {
      const data = await AvisosAPI.getCategorias();
      dispatch({ type: GET_CATEGORIAS_AVISO_SUCCESS, payload: data });
    } catch (err) {
      console.error(err);
    }
  };

  const createAviso = async (data) => {
    dispatch({ type: CREATE_AVISO_REQUEST });
    try {
      // Obtener usuarioID del localStorage
      let usuarioID = data.usuarioID;
      if (!usuarioID) {
        try {
          const userData = localStorage.getItem("user");
          if (userData) {
            const user = JSON.parse(userData);
            usuarioID = user.id || user.userID || user.usuarioID;
          }
        } catch (error) {
          console.error("Error al obtener usuario de localStorage:", error);
        }
      }

      // Usar 9 como fallback si no se obtuvo usuarioID
      if (!usuarioID) {
        usuarioID = 9;
      }

      const payload = {
        ...data,
        usuarioID: Number(usuarioID),
      };

      const created = await AvisosAPI.create(payload);
      dispatch({ type: CREATE_AVISO_SUCCESS, payload: created });
      return created;
    } catch (err) {
      console.error(err);
      dispatch({
        type: CREATE_AVISO_ERROR,
        payload: err.message || "Error al crear el aviso",
      });
      throw err;
    }
  };

  // Función auxiliar para crear aviso automáticamente desde un reporte
  const crearAvisoDesdeReporte = async (reporte, categoriaID = null) => {
    try {
      // Obtener categorías
      const categorias = await AvisosAPI.getCategorias();

      // Si no se proporciona categoriaID, usar la primera
      let categoriaSeleccionada;
      if (categoriaID) {
        categoriaSeleccionada = categorias.find(
          (cat) =>
            cat.CategoriaID === categoriaID || cat.categoriaID === categoriaID
        );
      }

      if (!categoriaSeleccionada && categorias.length > 0) {
        categoriaSeleccionada = categorias[0];
      }

      // Obtener usuarioID del localStorage
      let usuarioIDParaAviso = 9;
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          usuarioIDParaAviso = user.id || user.userID || user.usuarioID || 9;
        }
      } catch (error) {
        console.error("Error al obtener usuario de localStorage:", error);
      }

      const avisoData = {
        usuarioID: usuarioIDParaAviso,
        categoriaID:
          categoriaSeleccionada?.CategoriaID ||
          categoriaSeleccionada?.categoriaID ||
          1,
        titulo: `Resolución: ${reporte.titulo}`,
        descripcion:
          `Se ha atendido el reporte #${reporte.reporteID}:\n\n` +
          `• Tipo: ${reporte.tipoReporte}\n` +
          `• Descripción original: ${reporte.descripcion}\n` +
          `• Ubicación: ${reporte.direccionTexto}\n` +
          `• Fecha reporte: ${new Date(
            reporte.fechaCreacion
          ).toLocaleDateString()}\n\n` +
          `RESOLUCIÓN:\nEl incidente ha sido atendido y resuelto por las autoridades correspondientes.`,
        fechaEvento: new Date().toISOString().split("T")[0],
      };

      const avisoCreado = await createAviso(avisoData);
      console.log("Aviso creado automáticamente:", avisoCreado);
      location.reload();
      return avisoCreado;
    } catch (error) {
      console.error("No se pudo crear el aviso automáticamente:", error);
      // No lanzamos error para no interrumpir el flujo principal
    }
  };

  // Función para preparar la creación de aviso con selección de categoría
  const prepararMarcarComoAtendido = (reporte) => {
    setPendingReporte(reporte);
    setShowCategoriaModal(true);
  };

  const confirmarMarcarComoAtendido = async (categoriaID) => {
    if (!pendingReporte) return;

    try {
      await marcarVistoConCategoria(pendingReporte.reporteID, categoriaID);
      setShowCategoriaModal(false);
      setPendingReporte(null);
      return true;
    } catch (error) {
      console.error("Error al confirmar:", error);
      return false;
    }
  };

  // --------------- PROVIDER ------------------
  return (
    <ReportesContext.Provider
      value={{
        ...state,
        clearError,
        fetchReportes,
        fetchReporteById,
        fetchReportesByUsuario,
        fetchTiposReporte,
        createReporte,
        marcarVisto,
        marcarVistoConCategoria,
        prepararMarcarComoAtendido,
        fetchAvisos,
        fetchCategoriasAviso,
        createAviso,
        crearAvisoDesdeReporte,
        showCategoriaModal,
        setShowCategoriaModal,
        pendingReporte,
        confirmarMarcarComoAtendido,
      }}
    >
      {children}
    </ReportesContext.Provider>
  );
}
