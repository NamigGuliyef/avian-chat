import { ISheetColumn } from "@/types/types";
import axios from "."; // your preconfigured axios instance

// ----------------- Projects & Excels -----------------
export const getSupervisorProjects = async () => {
    const { data } = await axios.get(`/supervisor/projects`);
    console.log('supervisor projects', data);
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
export const getRows = async (sheetId: string, page = 1, limit = 50, skip = 0) => {
    const { data } = await axios.get(`/supervisor/sheet/${sheetId}/rows?page=${page}&limit=${limit}&skip=${skip}`);
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

export const getSupervisorReports = async (startDate?: string, endDate?: string) => {
    let query = "";
    if (startDate && endDate) {
        query = `?startDate=${startDate}&endDate=${endDate}`;
    }
    const { data } = await axios.get(`/supervisor/table-view${query}`);
    return data;
};

export const deleteRow = async (sheetId: string, rowNumber: number) => {
    const { data } = await axios.delete(`/supervisor/sheet/${sheetId}/rows/${rowNumber}`);
    return data;
};

// ----------------- Excel Import -----------------
export const importFromExcel = async (sheetId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const { data } = await axios.post(
        `/supervisor/sheet/${sheetId}/rows/import`,
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
        },
    );

    return data;
};



export const getSupervisorColumns = async (projectId): Promise<ISheetColumn[]> => {
    const { data } = await axios.get(`/supervisor/column/${projectId}`);
    return data;
};


export const createSupervisorColumn = async (payload: Partial<ISheetColumn>) => {
    const { data } = await axios.post('/supervisor/column', payload);
    return data;
};


export const updateSupervisorColumn = async (id: string, payload: Partial<ISheetColumn>) => {
    delete payload._id;
    delete (payload as any).createdAt;
    delete (payload as any).updatedAt;
    const { data } = await axios.patch(`/supervisor/column/${id}`, payload);
    return data;
};


export const deleteSupervisorColumn = async (id: string) => {
    const { data } = await axios.delete(`/supervisor/column/${id}`);
    return data;
};
