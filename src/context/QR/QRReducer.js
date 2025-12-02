// context/QR/QRReducer.js - VERSIÓN CORREGIDA
import {
  GET_QR_PERSONALES,
  GENERAR_QR,
  UPDATE_ESTADO_QR,
  SET_LOADING,
  SET_ERROR,
  SET_SCANNER_ACTIVE,
  CLEAR_ERROR,
} from "./ActionTypes";

export const QRReducer = (state, action) => {
  const { payload, type } = action;

  switch (type) {
    case GET_QR_PERSONALES:
      return {
        ...state,
        qrPersonales: payload,
        loading: false,
        error: null,
      };

    case GENERAR_QR:
      //Buscar por usuarioID correctamente
      const usuarioID = payload.usuarioID;
      
      return {
        ...state,
        qrPersonales: state.qrPersonales.map(item =>
          item.usuario.usuarioID === usuarioID
            ? { 
                ...item, 
                qr: payload 
              }
            : item
        ),
        loading: false,
        error: null,
      };

      case SET_SCANNER_ACTIVE:
      return {
        ...state,
        scannerActive: payload,
      };

    case UPDATE_ESTADO_QR:
      return {
        ...state,
        qrPersonales: state.qrPersonales.map(item =>
          item.qr?.qrid === payload.qrid
            ? { ...item, qr: { ...item.qr, activo: payload.activo } }
            : item
        ),
        loading: false,
        error: null,
      };

    case SET_LOADING:
      return { ...state, loading: payload };

    case SET_ERROR:
      return { ...state, error: payload, loading: false };

    case CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};