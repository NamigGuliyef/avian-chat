// AuthContext.tsx
import { AuthContextType, AuthSession } from "@/types/types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const SESSION_KEY = "auth_session";
export const SESSION_TOKEN_KEY = "auth_session_token_234rtgfd";


const getStoredSession = (): AuthSession => {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        return stored ? JSON.parse(stored) : { token: null };
    } catch {
        return { token: null };
    }
};

const defaultSession: AuthSession = getStoredSession();

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [session, setSessionState] = useState<AuthSession>(defaultSession);
    const navigate = useNavigate()

    useEffect(() => {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            setSessionState(JSON.parse(stored));
        }
    }, []);

    const setSession = (newSession: AuthSession) => {
        setSessionState(newSession);
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        localStorage.setItem(SESSION_TOKEN_KEY, newSession?.token)
    };

    const logout = () => {
        setSessionState(defaultSession);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_TOKEN_KEY);
        navigate('/')
    };

    const value: AuthContextType = {
        session,
        isAuthenticated: Boolean(session?.token),
        setSession,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuthContext must be used inside AuthProvider");
    }
    return ctx;
};


