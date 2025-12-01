// context/Servicios/ServiciosReducer.js
import {
  SERVICIOS_SET_LOADING,
  SERVICIOS_SET_ERROR,
  SERVICIOS_SET_TIPOS,
  SERVICIOS_SET_CATALOGO,
  SERVICIOS_ADD_CATALOGO,
  SERVICIOS_UPDATE_CATALOGO,
  SERVICIOS_SET_PERSONAL,
  SERVICIOS_ADD_PERSONAL,
  SERVICIOS_SET_SOLICITUDES,
  SERVICIOS_ADD_SOLICITUD,
  SERVICIOS_UPDATE_SOLICITUD,
  SERVICIOS_SET_CARGOS_SERVICIOS,
  SERVICIOS_ADD_CARGO_SERVICIO,
  SERVICIOS_SET_CARGOS_MANT,
  SERVICIOS_ADD_CARGO_MANT,
  SERVICIOS_UPDATE_CARGO_MANT,
} from "./ActionsTypes";

export default function ServiciosReducer(state, action) {
  switch (action.type) {
    case SERVICIOS_SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case SERVICIOS_SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case SERVICIOS_SET_TIPOS:
      return {
        ...state,
        tipos: action.payload || [],
      };

    // Catálogo
    case SERVICIOS_SET_CATALOGO:
      return {
        ...state,
        catalogo: action.payload || [],
      };

    case SERVICIOS_ADD_CATALOGO:
      return {
        ...state,
        catalogo: [action.payload, ...state.catalogo],
      };

    case SERVICIOS_UPDATE_CATALOGO:
      return {
        ...state,
        catalogo: state.catalogo.map((item) =>
          item.servicioID === action.payload.servicioID
            ? { ...item, ...action.payload }
            : item
        ),
      };

    // Personal de mantenimiento
    case SERVICIOS_SET_PERSONAL:
      return {
        ...state,
        personal: action.payload || [],
      };

    case SERVICIOS_ADD_PERSONAL:
      return {
        ...state,
        personal: [action.payload, ...state.personal],
      };

    // Solicitudes
    case SERVICIOS_SET_SOLICITUDES:
      return {
        ...state,
        solicitudes: action.payload || [],
      };

    case SERVICIOS_ADD_SOLICITUD:
      return {
        ...state,
        solicitudes: [action.payload, ...state.solicitudes],
      };

    case SERVICIOS_UPDATE_SOLICITUD:
      return {
        ...state,
        solicitudes: state.solicitudes.map((item) =>
          item.solicitudID === action.payload.solicitudID
            ? { ...item, ...action.payload }
            : item
        ),
      };

    // Cargos servicios
    case SERVICIOS_SET_CARGOS_SERVICIOS:
      return {
        ...state,
        cargosServicios: action.payload || [],
      };

    case SERVICIOS_ADD_CARGO_SERVICIO:
      return {
        ...state,
        cargosServicios: [action.payload, ...state.cargosServicios],
      };

    // Cargos mantenimiento
    case SERVICIOS_SET_CARGOS_MANT:
      return {
        ...state,
        cargosMantenimiento: action.payload || [],
      };

    case SERVICIOS_ADD_CARGO_MANT:
      return {
        ...state,
        cargosMantenimiento: [action.payload, ...state.cargosMantenimiento],
      };

    case SERVICIOS_UPDATE_CARGO_MANT:
      return {
        ...state,
        cargosMantenimiento: state.cargosMantenimiento.map((item) =>
          item.cargoMantenimientoID === action.payload.cargoMantenimientoID
            ? { ...item, ...action.payload }
            : item
        ),
      };

    default:
      return state;
  }
}
