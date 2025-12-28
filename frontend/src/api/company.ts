import { IChannel, ICompany, IUser, mokko, Roles } from "@/types/types";
import axios from "."

// company
export const getCompanies = async (): Promise<ICompany[]> => {
    const res = await axios.get(`/company`)
    // return res.data;
    return mokko.companies;
}
export const addCompany = async (data: any): Promise<ICompany> => {
    const res = await axios.post("/company", data)
    return res.data;
}
export const updateCompany = async (data: any) => {
    await axios.put(`/company/${data._id}`, data)
}
export const deleteCompany = async (companyId) => {
    await axios.delete(`/company/${companyId}`)
}

// users
export const getSupervisors = async (): Promise<IUser[]> => {
    const res = await axios.get(`/user?role=${Roles.Supervisor}`)
    // return res.data;
    return mokko.users
}
export const getUsers = async (filter): Promise<IUser[]> => {
    const res = await axios.get(`/user${filter}`)
    // return res.data;
    return mokko.users
}
export const addUser = async (data: any): Promise<IUser> => {
    const res = await axios.post("/user", data)
    return res.data;
}
export const updateUser = async (_id: string, data: any) => {
    await axios.put(`/user/${_id}`, data)
}
export const deleteUser = async (userId) => {
    await axios.delete(`/user/${userId}`)
}
export const updateUserChannels = async (userId, data) => {
    await axios.put(`/user/channels/${userId}`, data)
}
export const removeAgentFromCompany = async (userId, companyId) => {
    await axios.delete(`/user/company/${userId}/${companyId}`)
}


// channels
export const getChannels = async (companyId): Promise<IChannel[]> => {
    const res = await axios.get(`/channel/${companyId}`)
    // return res.data;
    return mokko.channels;
}
export const addChannel = async (data: { companyId: string; name: string; }): Promise<IChannel> => {
    const res = await axios.post("/channel", data)
    return res.data;
}
export const toggleChannelActive = async (_id: string) => {
    await axios.put(`/channel/${_id}`)
}
export const deleteChannel = async (channelId) => {
    await axios.delete(`/channel/${channelId}`)
}
