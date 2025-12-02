import React, { useReducer } from "react";
import AlertasContext from "./AlertasContext";
import {
  GET_ALERTAS,
  GET_ALERTAS_USUARIO,
  GET_ALERTA_DETALLE,
  CREAR_ALERTA,
  ATENDER_ALERTA,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
  SET_NOTIFICATION,
  CLEAR_NOTIFICATION,
} from "./ActionTypes";
import { AlertasReducer } from "./AlertasReducer";
import axios from "axios";
import { get } from "react-hook-form";

const initialState = {
  alertas: [],
  alertasUsuario: [],
  alertaDetalle: null,
  loading: false,
  error: null,
  notification: null,
};

const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5165/api";

const AlertasState = (props) => {
  const [state, dispatch] = useReducer(AlertasReducer, initialState);

  const setLoading = (val) => dispatch({ type: SET_LOADING, payload: val });
  const setError = (e) => dispatch({ type: SET_ERROR, payload: e });
  const clearError = () => dispatch({ type: CLEAR_ERROR });
  const setNotification = (n) => dispatch({ type: SET_NOTIFICATION, payload: n });
  const clearNotification = () => dispatch({ type: CLEAR_NOTIFICATION });

  const getAlertas = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/Alertas`);
      dispatch({ type: GET_ALERTAS, payload: res.data });
    } catch (err) {
      setError("No se pudieron cargar las alertas");
    }
  };

  // OBTENER DETALLE DE UNA ALERTA
const getAlertaDetalle = async (id) => {
  dispatch({ type: "LOADING" });

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/alertas/${id}`);

    if (!res.ok) {
      throw new Error("No se pudo obtener el detalle de la alerta");
    }

    const data = await res.json();

    dispatch({
      type: "SET_ALERTA_DETALLE",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "ERROR",
      payload: error.message,
    });
  }
};

const atenderAlerta = async (firebaseID) => {
  try {
    setLoading(true);

    await axios.put(`${API}/alertas/firebase/${firebaseID}/estatus`, {
      estatus: "atendida"
    });

    dispatch({
      type: ATENDER_ALERTA,
      payload: { firebaseID }
    });

    setNotification({
      type: "success",
      message: `Alerta atendida correctamente`
    });

  } catch (err) {
    setError("Error al atender alerta");
  }
};


  const isAlertaActiva = (a) => {
    return a?.estatus?.toLowerCase() === "activa";
  };

  return (
    <AlertasContext.Provider
      value={{
        ...state,
        getAlertas,
        atenderAlerta,
        isAlertaActiva,
        clearError,
        getAlertaDetalle,
        clearNotification,
      }}
    >
      {props.children}
    </AlertasContext.Provider>
  );
};

export default AlertasState;
