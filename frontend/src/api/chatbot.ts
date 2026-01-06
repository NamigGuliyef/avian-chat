import { ActionType, BlockType, ICompany } from "@/types/types";
import axios from ".";

export interface Chatbot {
    _id: string;
    name: string;
    companyId: ICompany;
    isActive?: boolean;
    isDeleted?: boolean;
    flowIds?: string[];
    triggerIds?: string[];
}

export interface CreateChatbotPayload {
    name: string;
    companyId: string;
    isActive?: boolean;
}

export interface Flow {
    _id: string;
    name: string;
    chatbotId: string;
    isDefault?: boolean;
    blocks?: FlowBlock[];
}

export interface CreateFlowPayload {
    name: string;
    chatbotId: string;
    isDefault?: boolean;
    blocks?: FlowBlock[];
}

export interface Trigger {
    _id: string;
    name: string;
    keywords: string[];
    chatbotId: string;
    targetFlowId: string;
    isActive: boolean;
}

export interface CreateTriggerPayload {
    name: string;
    keywords: string[];
    chatbotId: string;
    targetFlowId: string;
    isActive: boolean;
}

export interface FlowBlock {
    _id?: string;
    type: BlockType;
    content?: string;
    targetFlowId?: string;
    actionType?: ActionType;
    buttons?: FlowButton[];
}

export interface FlowButton {
    _id?: string;
    label: string;
    emoji?: string;
    goToFlowId?: string;
}

/* ======================================================
   CHATBOT API
====================================================== */

export const createChatbot = async (data: CreateChatbotPayload) => {
    const resp = await axios.post("/chatbot", data);
    return resp.data as Chatbot;
};

export const getAllChatbots = async () => {
    const resp = await axios.get("/chatbot");
    return resp.data as Chatbot[];
};

export const getChatbotsByCompanyId = async (companyId: string) => {
    const resp = await axios.get(`/chatbot/company/${companyId}`);
    return resp.data as Chatbot[];
};

export const getChatbotById = async (id: string) => {
    const resp = await axios.get(`/chatbot/${id}`);
    return resp.data as Chatbot;
};

export const updateChatbot = async (id: string, data: Partial<CreateChatbotPayload>) => {
    const resp = await axios.patch(`/chatbot/${id}`, data);
    return resp.data;
};

export const deleteChatbot = async (id: string) => {
    const resp = await axios.delete(`/chatbot/${id}`);
    return resp.data;
};

/* ======================================================
   FLOW API
====================================================== */

export const createFlow = async (data: CreateFlowPayload) => {
    const resp = await axios.post("/chatbot/flow", data);
    return resp.data as Flow;
};

export const updateFlow = async (flowId: string, data: Partial<CreateFlowPayload>) => {
    const resp = await axios.patch(`/chatbot/flow/${flowId}`, data);
    return resp.data;
};

export const getFlowById = async (flowId: string) => {
    const resp = await axios.get(`/chatbot/flow/${flowId}`);
    return resp.data as Flow;
};

export const getFlowsByChatbotId = async (chatbotId: string) => {
    const resp = await axios.get(`/chatbot/flow/chatbot/${chatbotId}`);
    return resp.data as Flow[];
};

export const deleteFlow = async (flowId: string) => {
    const resp = await axios.delete(`/chatbot/flow/${flowId}`);
    return resp.data;
};

/* ======================================================
   TRIGGER API
====================================================== */

export const createTrigger = async (data: CreateTriggerPayload) => {
    const resp = await axios.post("/chatbot/trigger", data);
    return resp.data as Trigger;
};

export const updateTrigger = async (triggerId: string, data: Partial<CreateTriggerPayload>) => {
    const resp = await axios.patch(`/chatbot/trigger/${triggerId}`, data);
    return resp.data;
};

export const getTriggerById = async (triggerId: string) => {
    const resp = await axios.get(`/chatbot/trigger/${triggerId}`);
    return resp.data as Trigger;
};
export const getTriggersByChatbotId = async (chatbotId: string) => {
    const resp = await axios.get(`/chatbot/trigger/chatbot/${chatbotId}`);
    return resp.data as Trigger[];
};

export const deleteTrigger = async (triggerId: string) => {
    const resp = await axios.delete(`/chatbot/trigger/${triggerId}`);
    return resp.data;
};

/* ======================================================
   FLOW BLOCK API
====================================================== */

export const createFlowBlock = async (data: FlowBlock) => {
    const resp = await axios.post("/chatbot/flow-blocks", data);
    return resp.data as FlowBlock;
};

export const updateFlowBlock = async (flowBlockId: string, data: Partial<FlowBlock>) => {
    const resp = await axios.patch(`/chatbot/flow-blocks/${flowBlockId}`, data);
    return resp.data;
};

export const getFlowBlockById = async (flowBlockId: string) => {
    const resp = await axios.get(`/chatbot/flow-block/${flowBlockId}`);
    return resp.data as FlowBlock;
};

export const deleteFlowBlock = async (flowBlockId: string) => {
    const resp = await axios.delete(`/chatbot/flow-blocks/${flowBlockId}`);
    return resp.data;
};

/* ======================================================
   FLOW BUTTON API
====================================================== */

export const createFlowButton = async (data: FlowButton) => {
    const resp = await axios.post("/chatbot/flow-buttons", data);
    return resp.data as FlowButton;
};

export const updateFlowButton = async (flowButtonId: string, data: Partial<FlowButton>) => {
    const resp = await axios.patch(`/chatbot/flow-buttons/${flowButtonId}`, data);
    return resp.data;
};

export const getFlowButtonById = async (flowButtonId: string) => {
    const resp = await axios.get(`/chatbot/flow-buttons/${flowButtonId}`);
    return resp.data as FlowButton;
};

export const deleteFlowButton = async (flowButtonId: string) => {
    const resp = await axios.delete(`/chatbot/flow-buttons/${flowButtonId}`);
    return resp.data;
};

/* ======================================================
   CHATBOT RUNTIME (for widget / greeting)
====================================================== */

export const greetingsRequest = async (companyId: string) => {
    const resp = await axios.get(`/chatbot/company/${companyId}`);
    return resp.data;
};

export const selectAFlow = async (flowId: string) => {
    const resp = await axios.get(`/chatbot/flow/${flowId}`);
    return resp.data as Flow;
};
