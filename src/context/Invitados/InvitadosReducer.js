// context/Invitados/InvitadosReducer.js
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

export const InvitadosReducer = (state, action) => {
  const { payload, type } = action;

  switch (type) {
    case GET_INVITACIONES:
      return {
        ...state,
        invitaciones: payload,
        loading: false,
        error: null,
      };

    case GET_INVITACIONES_USUARIO:
      return {
        ...state,
        invitacionesUsuario: payload,
        loading: false,
        error: null,
      };

    case CREAR_INVITACION:
      return {
        ...state,
        invitaciones: [payload, ...state.invitaciones],
        loading: false,
        error: null,
      };

    case CANCELAR_INVITACION:
      return {
        ...state,
        invitaciones: state.invitaciones.map(inv =>
          inv.invitadoID === payload
            ? { ...inv, estado: "Cancelado" }
            : inv
        ),
        loading: false,
        error: null,
      };

    case PROCESAR_QR:
      return {
        ...state,
        ultimoAcceso: payload,
        loading: false,
        error: null,
      };

    case SET_LOADING:
      return { ...state, loading: payload };

    case SET_ERROR:
      return { ...state, error: payload, loading: false };

    case CLEAR_ERROR:
      return { ...state, error: null };

    case SET_SCANNER_ACTIVE:
      return { ...state, scannerActive: payload };

    default:
      return state;
  }
};