import { useReducer } from "react";
import axios from "axios";
import PerfilContext from "./PerfilContext";
import PerfilReducer from "./PerfilReducer";
import { PERFIL_ACTIONS } from "./ActionsTypes";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const PerfilState = ({ children }) => {
  const initialState = {
    perfil: null,
    error: null,
    loading: false,
    saving: false,
  };

  const [state, dispatch] = useReducer(PerfilReducer, initialState);

  // Obtener perfil del usuario logueado
  const obtenerPerfil = async (userId) => {
    dispatch({ type: PERFIL_ACTIONS.LOADING });
    try {
      const res = await axios.get(`${API_URL}/Usuarios/${userId}`);
      dispatch({
        type: PERFIL_ACTIONS.OBTENER,
        payload: res.data,
      });
      return { success: true, data: res.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar el perfil";
      dispatch({
        type: PERFIL_ACTIONS.ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Actualizar perfil
  const actualizarPerfil = async (data) => {
    dispatch({ type: PERFIL_ACTIONS.SAVING });
    try {
      const res = await axios.put(`${API_URL}/Usuarios/update`, data);
      dispatch({
        type: PERFIL_ACTIONS.ACTUALIZAR,
        payload: res.data,
      });
      return { success: true, data: res.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al actualizar el perfil";
      dispatch({
        type: PERFIL_ACTIONS.ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Limpiar errores
  const clearError = () => {
    dispatch({ type: PERFIL_ACTIONS.CLEAR_ERROR });
  };

  return (
    <PerfilContext.Provider
      value={{
        perfil: state.perfil,
        error: state.error,
        loading: state.loading,
        saving: state.saving,
        obtenerPerfil,
        actualizarPerfil,
        clearError,
      }}
    >
      {children}
    </PerfilContext.Provider>
  );
};

export default PerfilState;
