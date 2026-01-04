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
export const getExcelSheets = async (exId) => {
    const { data } = await axios.get(`/supervisor/sheets/${exId}`);
    return data;
}
export const createExcelSheet = async (_data) => {
    const { data } = await axios.post(`/supervisor/sheet`, _data);
    return data;
}

export const updateExcelSheet = async (sheetId, _data) => {
    const { data } = await axios.patch(`/supervisor/sheet/${sheetId}`, _data);
    return data;
}

export const addColumnToExcel = async (sheetId, columnId, _data) => {
    const resp = await axios.post(`/supervisor/sheet/${sheetId}/column/${columnId}`, _data)
    return resp.data;
}

export const updateSheetColumn = async (columnId, _data) => {
    const { data } = await axios.patch(`/supervisor/column/${columnId}`, _data);
    return data;
}

export const getSheetColumns = async (sheetId) => {
    const { data } = await axios.get(`/supervisor/sheet/${sheetId}`);
    return data;
}
