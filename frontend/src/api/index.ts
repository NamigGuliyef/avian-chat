import { SESSION_KEY, SESSION_TOKEN_KEY } from "@/contexts/AuthContext";
import _axios from "axios";
import { toast } from "sonner";

const axios = _axios.create({
    // url: import.meta.env.REACT_BACKEND_URL
    baseURL: "http://94.20.88.192"
});

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

axios.interceptors.response.use(
    (response) => response,
    (err) => {
        const backendMessage =
            err?.response?.data?.message || "Something went wrong";

        toast.error(backendMessage);

        // Important: reject the promise so callers can handle it
        return Promise.reject(err);
    }
);

export default axios;
