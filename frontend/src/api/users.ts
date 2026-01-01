import axios from "."
import { IUser, Roles } from "@/types/types";

export const searchUsers = async (params: {
    query: string;
    role: string;
}): Promise<IUser[]> => {
    const { data } = await axios.get("/admin/users", {
        params
    });
    return data.data;
};
