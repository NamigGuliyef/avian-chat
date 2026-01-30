import axios from "."; // your preconfigured axios instance

// ----------------- Projects & Excels -----------------
export const getPartnerProjects = async () => {
    const { data } = await axios.get(`/partner/projects`);
    console.log('partner projects', data);
    return data;
};

export const getPartnerExcels = async (prId: string) => {
    const { data } = await axios.get(`/partner/excel/${prId}`);
    return data;
};

// ----------------- Sheets -----------------
export const getPartnerSheets = async (exId: string) => {
    const { data } = await axios.get(`/partner/sheets/${exId}`);
    return data;
};

// ----------------- Columns -----------------
export const getPartnerColumns = async (sheetId: string) => {
    const { data } = await axios.get(`/partner/sheet/${sheetId}`);
    return data;
};

// ----------------- Rows -----------------
export const getPartnerRows = async (sheetId: string, page = 1, limit = 50, skip = 0) => {
    const { data } = await axios.get(`/partner/sheet/${sheetId}/rows?page=${page}&limit=${limit}&skip=${skip}`);
    return data; // Note: simplified return for partner
};

export const getPartnerReports = async (startDate?: string, endDate?: string) => {
    const { data } = await axios.get(`/partner/table-view${startDate ? `?startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`);
    return data;
};
