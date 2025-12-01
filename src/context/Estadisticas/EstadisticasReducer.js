import { ESTADISTICAS_ACTIONS } from "./ActionsTypes";

export default function EstadisticasReducer(state, action) {
    switch (action.type) {
        case ESTADISTICAS_ACTIONS.LOADING:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case ESTADISTICAS_ACTIONS.GET_INCIDENTES:
            return {
                ...state,
                incidentes: action.payload,
                loading: false,
                error: null,
            };

        case ESTADISTICAS_ACTIONS.GET_PAGOS:
            return {
                ...state,
                pagos: action.payload,
                loading: false,
                error: null,
            };

        case ESTADISTICAS_ACTIONS.GET_SERVICIOS:
            return {
                ...state,
                servicios: action.payload,
                loading: false,
                error: null,
            };

        case ESTADISTICAS_ACTIONS.EXPORTAR_PDF:
            return {
                ...state,
                pdfUrl: action.payload,
                loading: false,
                error: null,
            };

        case ESTADISTICAS_ACTIONS.ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false,
            };

        case ESTADISTICAS_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
}