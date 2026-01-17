import axios from "."; // your preconfigured axios instance

// ----------------- Projects & Excels -----------------
export const getSupervisorProjects = async (supId: string) => {
    const { data } = await axios.get(`/supervisor/projects/${supId}`);
    return data;
};

export const getProjectAgents = async (prId: string) => {
    const { data } = await axios.get(`/supervisor/project/${prId}`);
    return data;
};

export const getProjectExcels = async (prId: string) => {
    const { data } = await axios.get(`/supervisor/excel/${prId}`);
    return data;
};

export const createExcel = async (_data: any) => {
    const { data } = await axios.post(`/supervisor/excel`, _data);
    return data;
};

export const updateExcel = async (excelId: string, _data: any) => {
    const { data } = await axios.patch(`/supervisor/excel/${excelId}`, _data);
    return data;
};

// ----------------- Sheets -----------------
export const getExcelSheets = async (exId: string) => {
    const { data } = await axios.get(`/supervisor/sheets/${exId}`);
    return data;
};

export const createExcelSheet = async (_data: any) => {
    const { data } = await axios.post(`/supervisor/sheet`, _data);
    return data;
};

export const updateExcelSheet = async (sheetId: string, _data: any) => {
    const { data } = await axios.patch(`/supervisor/sheet/${sheetId}`, _data);
    return data;
};

// ----------------- Columns -----------------
export const getColumns = async (sheetId: string) => {
    const { data } = await axios.get(`/supervisor/sheet/${sheetId}`);
    return data;
};

export const addColumn = async (sheetId: string, columnData: any) => {
    // columnId can be null for new column
    const columnId = columnData._id || "new";
    const { data } = await axios.post(`/supervisor/sheet/${sheetId}/column/${columnId}`, columnData);
    return data;
};

export const updateColumn = async (sheetId: string, columnId: string, columnData: any) => {
    const { data } = await axios.patch(`/supervisor/sheet/${sheetId}/column/${columnId}`, columnData);
    return data;
};

// ----------------- Rows -----------------
export const getRows = async (sheetId: string, page = 1, limit = 50) => {
    const { data } = await axios.get(`/supervisor/sheet/${sheetId}/rows?page=${page}&limit=${limit}`);
    return data.data;
};

export const addRow = async (sheetId: string, rowData: Record<string, any>) => {
    const { data } = await axios.post(`/supervisor/sheet/${sheetId}/rows`, rowData);
    return data;
};

export const updateRow = async (sheetId: string, rowNumber: number, rowData: Record<string, any>) => {
    const { data } = await axios.patch(`/supervisor/sheet/${sheetId}/rows/${rowNumber}`, rowData);
    return data;
};

export const updateCell = async (sheetId: string, rowNumber: number, key: string, value: any) => {
    const { data } = await axios.patch(`/supervisor/sheet/${sheetId}/rows/${rowNumber}`, { key, value });
    return data;
};

export const getSupervisorReports = async (supid: string) => {
    const { data } = await axios.get(`/supervisor/table-view/${supid}`);
    return data;
};

export const deleteRow = async (sheetId: string, rowNumber: number) => {
    const { data } = await axios.delete(`/supervisor/sheet/${sheetId}/rows/${rowNumber}`);
    return data;
};

// ----------------- Excel Import -----------------
export const importFromExcel = async (sheetId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.post(`/supervisor/sheet/${sheetId}/rows/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};
