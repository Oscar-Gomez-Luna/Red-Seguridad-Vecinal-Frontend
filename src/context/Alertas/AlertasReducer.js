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

export const AlertasReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {

    case SET_LOADING:
      return {
        ...state,
        loading: true,
      };

    case GET_ALERTAS:
      return {
        ...state,
        alertas: payload,
        loading: false,
        error: null,
      };

    case GET_ALERTAS_USUARIO:
      return {
        ...state,
        alertasUsuario: payload,
        loading: false,
        error: null,
      };

    case GET_ALERTA_DETALLE:
      return {
        ...state,
        alertaDetalle: payload,
        loading: false,
        error: null,
      };

    case CREAR_ALERTA:
      return {
        ...state,
        alertas: [payload, ...state.alertas],
        loading: false,
        error: null,
      };

    case ATENDER_ALERTA:
      return {
        ...state,

        // Actualizar lista completa
        alertas: state.alertas.map(a =>
          a.firebaseID === payload.firebaseID
            ? { ...a, estatus: "atendida" }
            : a
        ),

        // Actualizar detalle actual
        alertaDetalle:
          state.alertaDetalle?.firebaseID === payload.firebaseID
            ? { ...state.alertaDetalle, estatus: "atendida" }
            : state.alertaDetalle,

        loading: false,
        error: null,
      };

    case SET_ERROR:
      return { ...state, error: payload, loading: false };

    case CLEAR_ERROR:
      return { ...state, error: null };

    case SET_NOTIFICATION:
      return { ...state, notification: payload };

    case CLEAR_NOTIFICATION:
      return { ...state, notification: null };

    default:
      return state;
  }
};
