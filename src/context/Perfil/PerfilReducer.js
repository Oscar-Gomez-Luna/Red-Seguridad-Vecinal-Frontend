import { PERFIL_ACTIONS } from "./ActionsTypes";

export default function PerfilReducer(state, action) {
    switch (action.type) {
        case PERFIL_ACTIONS.LOADING:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case PERFIL_ACTIONS.SAVING:
            return {
                ...state,
                saving: true,
                error: null,
            };

        case PERFIL_ACTIONS.OBTENER:
            return {
                ...state,
                perfil: action.payload,
                loading: false,
                error: null,
            };

        case PERFIL_ACTIONS.ACTUALIZAR:
            return {
                ...state,
                perfil: action.payload,
                saving: false,
                error: null,
            };

        case PERFIL_ACTIONS.ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false,
                saving: false,
            };

        case PERFIL_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
}