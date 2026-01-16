import { IChannel, ICompany, IProject, IUser, Roles } from "@/types/types";
import axios from "."

// company
export const getCompanies = async (): Promise<ICompany[]> => {
    const res = await axios.get(`/admin/company`)
    return res.data;
    // return mokko.companies;
}
export const getCompanyById = async (id): Promise<ICompany> => {
    const res = await axios.get(`/admin/company/${id}`)
    return res.data;
    // return mokko.companies;
}
export const addCompany = async (data: any): Promise<ICompany> => {
    const res = await axios.post("/admin/create-company", data)
    return res.data.company;
}
export const updateCompany = async (data: any) => {
    const d = await axios.patch(`/admin/update-company/${data._id}`, data)
    return d.data.company
}
export const deleteCompany = async (companyId) => {
    await axios.delete(`/admin/delete-company/${companyId}`)
}

// users
export const getSupervisors = async (): Promise<IUser[]> => {
    const res = await axios.get(`/user?role=${Roles.Supervisor}`)
    return res.data;
}

export const getUsers = async (filter): Promise<IUser[]> => {
    const res = await axios.get(`/user${filter}`)
    return res.data;
}
export const addUser = async (data: any): Promise<IUser> => {
    // const res = await axios.post("/user", data)
    // return res.data;
    return [] as any
}
export const updateUser = async (_id: string, data: any) => {
    const d = await axios.patch(`/admin/update-user-info/${_id}`, data)
    return d.data
}
export const deleteUser = async (userId) => {
    // await axios.delete(`/user/${userId}`)
}
export const updateUserChannels = async (userId, data) => {
    // await axios.put(`/user/channels/${userId}`, data)
}
export const removeAgentFromCompany = async (userId, companyId) => {
    // await axios.delete(`/user/company/${userId}/${companyId}`)
}


// channels
export const getChannels = async (companyId): Promise<IChannel[]> => {
    const res = await axios.get(`/admin/channel/company/${companyId}`)
    console.log('dassa', res.data)
    return res.data;
    // return mokko.channels;
}
export const addChannel = async (data: { companyId: string; name: string; }): Promise<IChannel> => {
    const res = await axios.post("/admin/create-channel", data)
    return res.data.channel;
}
export const addUserToChannel = async (userId, channelId) => {
    const res = await axios.post(`/admin/assign-channel-to-user/${userId}`, [channelId])
    return res.data;
}
export const removeChannelFromUser = async (userId, channelId) => {
    const res = await axios.post(`/admin/remove-channel-from-user/${userId}`, [channelId])
    return res.data;
}
export const updateChannel = async (_id: string, data: Partial<IChannel>) => {
    const d = await axios.patch(`/admin/update-channel/${_id}`, data)
    return d.data.channel
}
export const deleteChannel = async (channelId) => {
    // await axios.delete(`/admin/delete-channel/${channelId}`)
}



// projects
export const getProjects = async (companyId): Promise<IProject[]> => {
    const res = await axios.get(`/admin/project/company/${companyId}`)
    return res.data;
}
export const getProjectById = async (id): Promise<IProject> => {
    const res = await axios.get(`/admin/project/${id}`)
    return res.data;
}
export const addProject = async (data: Partial<IProject>): Promise<IProject> => {
    const res = await axios.post("/admin/create-project", data)
    return res.data.project;
}
export const updateProject = async (projectId, data: any) => {
    const d = await axios.patch(`/admin/update-project/${projectId}`, data)
    return d.data.project
}
export const addProjectMember = async (projectId, userId, type) => {
    const d = await axios.patch(`/admin/add-project-members/${projectId}/${userId}/${type}`)
    return d.data.project
}
export const removeProjectMember = async (projectId, userId, type) => {
    const d = await axios.delete(`/admin/remove-project-members/${projectId}/${userId}/${type}`)
    return d.data.project
}

export const deleteProject = async (projectId) => {
    await axios.delete(`/admin/delete-project/${projectId}`)
}


// report

export const getReport = async (query?: string) => {
    const res = await axios.get(`/admin/all-report${query ? `?query=${encodeURIComponent(query)}` : ""}`)
    return res.data;
}


// logs
export const getAllLogs = async (query?: string) => {
    const res = await axios.get(`/admin/all-logs${query ? `?query=${encodeURIComponent(query)}` : ""}`)
    return res.data;
}
