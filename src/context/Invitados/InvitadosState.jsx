// context/Invitados/InvitadosState.jsx
import React, { useReducer } from "react";
import InvitadosContext from "./InvitadosContext";
import {
  GET_INVITACIONES,
  GET_INVITACIONES_USUARIO,
  CREAR_INVITACION,
  CANCELAR_INVITACION,
  PROCESAR_QR,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
  SET_SCANNER_ACTIVE,
} from "./ActionTypes";
import { InvitadosReducer } from "./InvitadosReducer";
import axios from "axios";

const initialState = {
  invitaciones: [],
  invitacionesUsuario: [],
  ultimoAcceso: null,
  scannerActive: false,
  loading: false,
  error: null,
};

const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5165/api";

const InvitadosState = (props) => {
  const [state, dispatch] = useReducer(InvitadosReducer, initialState);

  const setLoading = (value) => dispatch({ type: SET_LOADING, payload: value });
  const setError = (error) => dispatch({ type: SET_ERROR, payload: error });
  const clearError = () => dispatch({ type: CLEAR_ERROR });
  const setScannerActive = (active) => dispatch({ type: SET_SCANNER_ACTIVE, payload: active });

  const getInvitaciones = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/Invitados`);
      
      dispatch({
        type: GET_INVITACIONES,
        payload: res.data,
      });

      return res.data;
    } catch (error) {
      console.error("Error al obtener invitaciones:", error);
      setError("No se pudieron cargar las invitaciones.");
      return [];
    }
  };

  const getInvitacionesByUsuario = async (usuarioId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/Invitados/usuario/${usuarioId}`);
      
      dispatch({
        type: GET_INVITACIONES_USUARIO,
        payload: res.data,
      });

      return res.data;
    } catch (error) {
      console.error("Error al obtener invitaciones del usuario:", error);
      setError("No se pudieron cargar las invitaciones del usuario.");
      return [];
    }
  };

  const crearInvitacion = async (invitacionData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/Invitados`, invitacionData);
      
      dispatch({
        type: CREAR_INVITACION,
        payload: res.data,
      });

      return res.data;
    } catch (error) {
      console.error("Error al crear invitación:", error);
      setError("No se pudo crear la invitación.");
      return null;
    }
  };

  const cancelarInvitacion = async (invitadoID) => {
    try {
      setLoading(true);
      await axios.put(`${API}/Invitados/${invitadoID}/cancelar`);
      
      dispatch({
        type: CANCELAR_INVITACION,
        payload: invitadoID,
      });

      return true;
    } catch (error) {
      console.error("Error al cancelar invitación:", error);
      setError("No se pudo cancelar la invitación.");
      return false;
    }
  };

  const procesarQRCode = async (qrCode) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/accesos/validar/${qrCode}`);
      
      const resultado = {
        timestamp: new Date().toLocaleTimeString(),
        qrCode: qrCode,
        resultado: res.data,
        success: true
      };

      dispatch({
        type: PROCESAR_QR,
        payload: resultado,
      });

      await getInvitaciones();
      
      return resultado;
    } catch (error) {
      console.error("Error procesando QR:", error);
      
      const resultado = {
        timestamp: new Date().toLocaleTimeString(),
        qrCode: qrCode,
        error: error.response?.data?.message || error.message,
        success: false
      };

      dispatch({
        type: PROCESAR_QR,
        payload: resultado,
      });

      return resultado;
    }
  };

  const generarQRImage = (codigoQR, size = 80) => {
    if (!codigoQR) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(codigoQR)}`;
  };

  const descargarQR = async (codigoQR, nombreArchivo = 'qr_invitado') => {
    if (!codigoQR) return;
    
    try {
      const qrImageUrl = generarQRImage(codigoQR, 300);
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${nombreArchivo}_${codigoQR}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error al descargar QR:', error);
      setError('No se pudo descargar el QR');
    }
  };

  return (
    <InvitadosContext.Provider
      value={{
        invitaciones: state.invitaciones,
        invitacionesUsuario: state.invitacionesUsuario,
        ultimoAcceso: state.ultimoAcceso,
        scannerActive: state.scannerActive,
        loading: state.loading,
        error: state.error,

        getInvitaciones,
        getInvitacionesByUsuario,
        crearInvitacion,
        cancelarInvitacion,
        procesarQRCode,
        generarQRImage,
        descargarQR,
        setScannerActive,
        setError,
        clearError,
      }}
    >
      {props.children}
    </InvitadosContext.Provider>
  );
};

export default InvitadosState;