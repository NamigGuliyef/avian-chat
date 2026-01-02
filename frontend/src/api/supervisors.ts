import axios from "."

export const getSupervisorProjects = async (supId) => {
    const { data } = await axios.get(`/supervisor/projects/${supId}`);
    return data;
}
