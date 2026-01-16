import { useAuthContext } from "@/contexts/AuthContext";
import { useMemo } from "react";

export const useSession = () => {
    return useAuthContext();
};

export const useToken = () => {
    const { session } = useAuthContext();
    return session?.token;
};

function decodeJwt<T>(token: string): T | null {
    try {
        const payload = token.split(".")[1];
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

export const useDecodedToken = <T = any>(): T | null => {
    const token = useToken();

    return useMemo(() => {
        if (!token) return null;
        return decodeJwt<T>(token);
    }, [token]);
};
