import _axios from "axios";
import { toast } from "sonner";

const axios = _axios.create({
    // url: import.meta.env.REACT_BACKEND_URL
    baseURL: "https://avian-2.vercel.app"
});

export const LS_ACCESS_TOKEN_NAME = "token_sidbfehfdb"
let accessToken: string | null = localStorage.getItem(LS_ACCESS_TOKEN_NAME)
axios.interceptors.request.use(async (config) => {
    if (!accessToken) {
        accessToken = localStorage.getItem(LS_ACCESS_TOKEN_NAME)
    }

    if (accessToken) {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
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
