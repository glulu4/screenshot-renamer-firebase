import {User} from "app/types/types";

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

// Define the initial state for the AuthState
export const initialAuthState: AuthState = {
    user: null,
    loading: true,
    error: null,
};

// Define action types for the reducer
export enum AuthActionType {
    SET_USER = "SET_USER",
    SET_LOADING = "SET_LOADING",
    SET_ERROR = "SET_ERROR",
    LOGOUT = "LOGOUT",
}

// Define the possible actions for the reducer
type AuthAction =
    | {type: AuthActionType.SET_USER; payload: User | null}
    | {type: AuthActionType.SET_LOADING; payload: boolean}
    | {type: AuthActionType.SET_ERROR; payload: string | null}
    | {type: AuthActionType.LOGOUT};

// Create the reducer function
export function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case AuthActionType.SET_USER:
            return {...state, 
                user: action.payload, 
                loading: false, 
                error: null
            };
        case AuthActionType.SET_LOADING:
            return {...state, 
                loading: action.payload
            };
        case AuthActionType.SET_ERROR:
            return {...state, 
                error: action.payload, 
                loading: false
            };
        case AuthActionType.LOGOUT:
            return {
                ...state, 
                user: null, 
                loading: false, 
                error: null
            };
        default:
            return state;
    }
}
