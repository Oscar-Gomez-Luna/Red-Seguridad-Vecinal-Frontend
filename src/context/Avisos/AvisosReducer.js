import {
    GET_AVISOS,
    GET_AVISO,
    CREATE_AVISO,
    UPDATE_AVISO,
    DELETE_AVISO,
    GET_AVISOS_CATEGORIAS,
    SET_LOADING,
    SET_ERROR,
    CLEAR_ERROR,
} from "./ActionsTypes";

export const AvisosReducer = (state, action) => {
    const { type, payload } = action;

    switch (type) {
        case GET_AVISOS:
            return {
                ...state,
                avisos: payload,
                loading: false,
                error: null,
            };

        case GET_AVISO:
            return {
                ...state,
                avisoActual: payload,
                loading: false,
                error: null,
            };

        case CREATE_AVISO:
            return {
                ...state,
                avisos: [...state.avisos, payload],
                loading: false,
                error: null,
            };

        case UPDATE_AVISO:
            return {
                ...state,
                avisos: state.avisos.map((av) =>
                    av.id === payload.id ? payload : av
                ),
                loading: false,
                error: null,
            };

        case DELETE_AVISO:
            return {
                ...state,
                avisos: state.avisos.filter((av) => av.id !== payload),
                loading: false,
                error: null,
            };

        case GET_AVISOS_CATEGORIAS:
            return {
                ...state,
                categorias: payload,
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
