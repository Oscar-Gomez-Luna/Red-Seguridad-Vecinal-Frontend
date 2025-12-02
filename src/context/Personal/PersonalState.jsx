import React, { useReducer } from "react";
import PersonalContext from "./PersonalContext";
import {
  GET_PERSONAL_MANTENIMIENTO,
  GET_PERSONAL_MANTENIMIENTO_BY_ID,
  CREAR_PERSONAL_MANTENIMIENTO,
  ACTUALIZAR_PERSONAL_MANTENIMIENTO,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
  SET_NOTIFICATION,
  CLEAR_NOTIFICATION,
} from "./ActionTypes";
import { PersonalReducer } from "./PersonalReducer";
import axios from "axios";

const initialState = {
  personalMantenimiento: [],
  personalDetalle: null,
  loading: false,
  error: null,
  notification: null,
};

const API = import.meta.env.VITE_API_BASE_URL;

const ServiciosState = (props) => {
  const [state, dispatch] = useReducer(PersonalReducer, initialState);

  const setLoading = (value) => dispatch({ type: SET_LOADING, payload: value });
  const setError = (error) => dispatch({ type: SET_ERROR, payload: error });
  const clearError = () => dispatch({ type: CLEAR_ERROR });
  const setNotification = (notification) =>
    dispatch({ type: SET_NOTIFICATION, payload: notification });
  const clearNotification = () => dispatch({ type: CLEAR_NOTIFICATION });

  const getPersonalMantenimiento = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/Servicios/personal-mantenimiento`);
      dispatch({
        type: GET_PERSONAL_MANTENIMIENTO,
        payload: res.data,
      });

      return res.data;
    } catch (error) {
      console.error("Error al obtener personal de mantenimiento:", error);
      setError("No se pudo cargar el personal de mantenimiento.");
      return [];
    }
  };

  const getPersonalMantenimientoById = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/Servicios/personal-mantenimiento/${id}`
      );

      dispatch({
        type: GET_PERSONAL_MANTENIMIENTO_BY_ID,
        payload: res.data,
      });

      return res.data;
    } catch (error) {
      console.error("Error al obtener detalle del personal:", error);
      setError("No se pudo cargar el detalle del personal.");
      return null;
    }
  };

  const crearPersonalMantenimiento = async (personalData) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API}/Servicios/personal-mantenimiento`,
        personalData
      );

      dispatch({
        type: CREAR_PERSONAL_MANTENIMIENTO,
        payload: res.data,
      });

      await getPersonalMantenimiento();

      setNotification({
        type: "success",
        message: "Personal de mantenimiento registrado exitosamente",
      });

      return res.data;
    } catch (error) {
      console.error("Error al crear personal de mantenimiento:", error);
      setError("No se pudo registrar el personal de mantenimiento.");
      return null;
    }
  };

  const actualizarPersonalMantenimiento = async (id, personalData) => {
    try {
      setLoading(true);
      const res = await axios.patch(
        `${API}/Servicios/personal-mantenimiento/${id}`,
        personalData
      );

      dispatch({
        type: ACTUALIZAR_PERSONAL_MANTENIMIENTO,
        payload: res.data,
      });

      await getPersonalMantenimiento();

      setNotification({
        type: "success",
        message: "Personal de mantenimiento actualizado exitosamente",
      });

      return res.data;
    } catch (error) {
      console.error("Error al actualizar personal de mantenimiento:", error);
      setError("No se pudo actualizar el personal de mantenimiento.");
      return null;
    }
  };

  const actualizarPersonalMantenimientoCompleto = async (id, personalData) => {
    try {
      setLoading(true);

      console.log("Enviando datos de actualización completa:", personalData);

      const res = await axios.put(
        `${API}/Servicios/personal-mantenimiento/${id}/completo`,
        personalData
      );

      console.log("Respuesta del servidor (completo):", res.data);

      // Recargar la lista para ver los cambios
      await getPersonalMantenimiento();

      setNotification({
        type: "success",
        message: "Personal de mantenimiento actualizado exitosamente",
      });

      return res.data;
    } catch (error) {
      console.error(
        "Error al actualizar personal de mantenimiento completo:",
        error
      );
      setError("No se pudo actualizar el personal de mantenimiento.");
      return null;
    }
  };

  return (
    <PersonalContext.Provider
      value={{
        personalMantenimiento: state.personalMantenimiento,
        personalDetalle: state.personalDetalle,
        loading: state.loading,
        error: state.error,
        notification: state.notification,

        getPersonalMantenimiento,
        getPersonalMantenimientoById,
        crearPersonalMantenimiento,
        actualizarPersonalMantenimiento,
        actualizarPersonalMantenimientoCompleto,
        setError,
        clearError,
        setNotification,
        clearNotification,
      }}
    >
      {props.children}
    </PersonalContext.Provider>
  );
};

export default ServiciosState;
