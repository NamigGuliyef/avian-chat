import axios from ".";

export const greetingsRequest = async (companyId) => {

}
export const selectAFlow = async (flowId) => {
    const resp = await axios.get(`?id=${flowId}`)
    return resp.data;
}
