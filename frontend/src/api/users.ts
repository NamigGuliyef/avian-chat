import axios from "."
import { IUser, Roles } from "@/types/types";

export const searchUsers = async (params?: {
    query: string;
    role: string;
}): Promise<IUser[]> => {
    const { data } = await axios.get("/admin/users", {
        params
    });
    return data.data;
};
export const signUp = async (_data: Partial<IUser>): Promise<IUser[]> => {
    const { data } = await axios.post("/auth/signup", _data);
    return data.data;
};
export const getSupervisorAgents = async (supId) => {
    const { data } = await axios.get(`/admin/supervisor/${supId}/agents`);
    return data;
}
export const getUserExcels = async () => {
    const { data } = await axios.get(`/user/excels`);
    return data;
}
export const getUserSheets = async () => {
    const { data } = await axios.get(`/user/sheets`);
    return data;
}
export const getUserColumns = async () => {
    const { data } = await axios.get(`/user/columns`);
    return data;
}
export const getSheetsByExcelId = async (excelId) => {
    const { data } = await axios.get(`/user/sheets/excel/${excelId}`);
    return data;
}
export const getColumnsBySheetId = async (sheetId) => {
    const { data } = await axios.get(`/user/columns/sheet/${sheetId}`);
    return data;
}
