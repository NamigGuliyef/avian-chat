import { ISheetColumn } from "@/types/types";
import axios from ".";


export const getAdminColumns = async (): Promise<ISheetColumn[]> => {
    const { data } = await axios.get('/admin/column');
    return data;
};


export const createAdminColumn = async (payload: Partial<ISheetColumn>) => {
    const { data } = await axios.post('/admin/column', payload);
    return data;
};


export const updateAdminColumn = async (id: string, payload: Partial<ISheetColumn>) => {
    delete payload._id;
    delete (payload as any).createdAt;
    delete (payload as any).updatedAt;
    const { data } = await axios.patch(`/admin/column/${id}`, payload);
    return data;
};


export const deleteAdminColumn = async (id: string) => {
    const { data } = await axios.delete(`/admin/column/${id}`);
    return data;
};
