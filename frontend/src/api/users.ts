import axios from "."
import { IUser, Roles, SheetColumnForm, SheetRowForm } from "@/types/types";

export const searchUsers = async (params?: {
    query: string;
    role: string;
}): Promise<IUser[]> => {
    const { data } = await axios.get("/admin/users", {
        params
    });
    return data.data;
};

export interface ILoginUser {
    _id: string;
    name: string;
    surname: string;
    email: string;
    role: string;
    onlineStatus: string;
    chatbotEnabled: string;
}
export const login = async (body: { email: string; password: string }): Promise<{ token: string; user: ILoginUser; }> => {
    const { data } = await axios.post("/auth/login", body);
    return data;
};
export const signUp = async (_data: Partial<IUser>): Promise<IUser[]> => {
    const { data } = await axios.post("/auth/signup", _data);
    return data;
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
export const getColumnsBySheetId = async (sheetId, page = 1, limit = 50): Promise<IUserSheetResponse> => {
    const { data } = await axios.get(`/user/columns/sheet/${sheetId}?page=${page}&limit=${limit}`);
    return data;
}

export interface IUserSheetResponse {
    columns: SheetColumnForm[];
    rows: SheetRowForm[];
}
