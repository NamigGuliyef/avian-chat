import _axios from "axios";

const axios = _axios.create({
    url: ""
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
    (response) => {
        return response;
    },
    (err) => {
        throw new Error(err.response.data.title);
    }
);

export default axios;
