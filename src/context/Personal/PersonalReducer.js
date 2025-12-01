// context/Servicios/PersonalReducer.js
import {
  GET_PERSONAL_MANTENIMIENTO,
  GET_PERSONAL_MANTENIMIENTO_BY_ID,
  CREAR_PERSONAL_MANTENIMIENTO,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
  SET_NOTIFICATION,
  CLEAR_NOTIFICATION,
} from "./ActionTypes";

export const PersonalReducer = (state, action) => {
  const { payload, type } = action;

  switch (type) {
    case GET_PERSONAL_MANTENIMIENTO:
      return {
        ...state,
        personalMantenimiento: payload,
        loading: false,
        error: null,
      };

    case GET_PERSONAL_MANTENIMIENTO_BY_ID:
      return {
        ...state,
        personalDetalle: payload,
        loading: false,
        error: null,
      };

    case CREAR_PERSONAL_MANTENIMIENTO:
      return {
        ...state,
        personalMantenimiento: [payload, ...state.personalMantenimiento],
        loading: false,
        error: null,
      };

    case SET_LOADING:
      return { ...state, loading: payload };

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