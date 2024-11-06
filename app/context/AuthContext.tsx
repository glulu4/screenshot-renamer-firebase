"use client";

import React, {createContext, useReducer, useContext, useEffect, ReactNode} from "react";
import {getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, User as FirebaseUser} from "firebase/auth";
import {auth} from "../../firebaseConfig"
import {createTestUser} from "./util";
import {User, UserDataOnRegister} from "app/types/types";
import {addNewUser} from "app/cloudfns/addFns";
import {AuthActionType, authReducer, AuthState, initialAuthState} from "app/reducers/authReducer";
import {getUser} from "app/cloudfns/getFns";

// Create the AuthContext with the necessary properties
const AuthContext = createContext<{
    state: AuthState;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, userData: UserDataOnRegister) => Promise<void>
} | null>(null);

// Define the AuthProvider component
export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [state, dispatch] = useReducer(authReducer, initialAuthState);

    async function getUserFromFirestore(uid:string):Promise<User | null>{
        const userObj: User | null = await getUser(uid);
        return userObj;
    }
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userObj = await getUserFromFirestore(user.uid)
                dispatch({type: AuthActionType.SET_USER, payload: userObj});
            } else {
                dispatch({type: AuthActionType.LOGOUT});
            }
        });
        return () => unsubscribe();
    }, []);

    // Login function
    const login = async (email: string, password: string) => {
        dispatch({type: AuthActionType.SET_LOADING, payload: true});
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userObj = await getUserFromFirestore(userCredential.user.uid)
            dispatch({type: AuthActionType.SET_USER, payload: userObj});
        } catch (error: any) {
            dispatch({type: AuthActionType.SET_ERROR, payload: error.message});
        }
    };

    // Logout function
    const logout = async () => {
        await signOut(auth);
        dispatch({type: AuthActionType.LOGOUT});
    };

    // Register function
    const register = async (email: string, password: string, userData: UserDataOnRegister) => {
        dispatch({type: AuthActionType.SET_LOADING, payload: true});
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            const user = userCredential.user;
            const newUser:User = createTestUser(user.uid, userData.firstName, userData.lastName, email);

            const addedUser: User | null = await addNewUser(newUser); // Implement `addNewUser` to save user to Firestore
            dispatch({type: AuthActionType.SET_USER, payload: addedUser});

            if (!addedUser)
                throw new Error("User object came back null");




        } catch (error: any) {
            dispatch({type: AuthActionType.SET_ERROR, payload: error.message});
        }
    };

    return (
        <AuthContext.Provider value={{state, login, logout, register}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};