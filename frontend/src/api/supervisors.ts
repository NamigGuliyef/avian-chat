import axios from "."

export const getSupervisorProjects = async (supId) => {
    const { data } = await axios.get(`/supervisor/projects/${supId}`);
    return data;
}
export const getProjectExcels = async (prId) => {
    const { data } = await axios.get(`/supervisor/excel/${prId}`);
    return data;
}
export const getProjectAgents = async (prId) => {
    const { data } = await axios.get(`/supervisor/project/${prId}`);
    return data;
}
export const createExcel = async (_data) => {
    const { data } = await axios.post(`/supervisor/excel`, _data);
    return data;
}

export const updateExcel = async (excelId, _data) => {
    const { data } = await axios.patch(`/supervisor/excel/${excelId}`, _data);
    return data;
}

