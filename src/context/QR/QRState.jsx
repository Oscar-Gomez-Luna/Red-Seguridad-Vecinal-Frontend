// context/QR/QRState.jsx - FUNCIONES AGREGADAS
import React, { useReducer } from "react";
import QRContext from "./QRContext";
import {
  GET_QR_PERSONALES,
  GENERAR_QR,
  UPDATE_ESTADO_QR,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
} from "./ActionTypes";
import { QRReducer } from "./QRReducer";
import axios from "axios";
import { get } from "react-hook-form";

const initialState = {
  qrPersonales: [],
  loading: false,
  error: null,
};

const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5165/api";

const QRState = (props) => {
  const [state, dispatch] = useReducer(QRReducer, initialState);

  const setLoading = (value) => dispatch({ type: SET_LOADING, payload: value });
  const setError = (error) => dispatch({ type: SET_ERROR, payload: error });
  const clearError = () => dispatch({ type: CLEAR_ERROR });

  // 🔥 NUEVA FUNCIÓN: Obtener imagen del QR
  const getQRImage = (codigoQR, size = 120) => {
    if (!codigoQR) return null;
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(codigoQR)}`;
  };

    const setScannerActive = (active) => {
    dispatch({ type: SET_SCANNER_ACTIVE, payload: active });
  };

  const descargarQR = async (codigoQR, nombreArchivo = 'qr_personal') => {
    if (!codigoQR) return;
    
    try {
      const qrImageUrl = getQRImage(codigoQR, 300);
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

  const getQRPersonales = async () => {
    try {
      setLoading(true);
      
      const usuariosRes = await axios.get(`${API}/Usuarios`);
      const usuarios = usuariosRes.data;

      const qrPromises = usuarios.map(usuario =>
        axios.get(`${API}/QRPersonal/usuario/${usuario.usuarioID}`)
          .then(res => res.data)
          .catch(() => null)
      );

      const qrResults = await Promise.all(qrPromises);

      const mergedData = usuarios.map((usuario, index) => ({
        usuario,
        qr: qrResults[index],
      }));

      dispatch({
        type: GET_QR_PERSONALES,
        payload: mergedData,
      });

      return mergedData;
    } catch (error) {
      console.error("Error al obtener QR personales:", error);
      setError("No se pudieron cargar los usuarios y sus QR.");
      return [];
    }
  };

  const generarQR = async (usuarioID) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/QRPersonal/generar`, { usuarioID });
      
      dispatch({
        type: GENERAR_QR,
        payload: res.data,
      });

      await getQRPersonales();

      return res.data;
    } catch (error) {
      console.error("Error al generar QR:", error);
      setError("No se pudo generar el QR.");
      return null;
    }
  };

  const actualizarEstadoQR = async (qrid, activo) => {
    try {
      setLoading(true);
      await axios.put(`${API}/QRPersonal/${qrid}/estado`, { activo });
      
      dispatch({
        type: UPDATE_ESTADO_QR,
        payload: { qrid, activo },
      });

      return true;
    } catch (error) {
      console.error("Error al actualizar estado QR:", error);
      setError("No se pudo actualizar el estado del QR.");
      return false;
    }
  };

  return (
    <QRContext.Provider
      value={{
        qrPersonales: state.qrPersonales,
        loading: state.loading,
        error: state.error,

        // Métodos existentes
        getQRPersonales,
        generarQR,
        actualizarEstadoQR,
        setError,
        clearError,
        getQRImage,
        descargarQR,
      }}
    >
      {props.children}
    </QRContext.Provider>
  );
};

export default QRState;