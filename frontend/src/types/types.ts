import { Shield, UserCog, UserIcon } from "lucide-react";

export enum ProjectType {
    Outbound = "0",
    Inbound = "1"
}
export enum ProjectDirection {
    Call = "0",
    Social = "1"
}
export enum ProjectName {
    Survey = "0",
    Telesales = "1",
    Telemarketing = "2",
}

export interface ICompany {
    _id?: string;
    name: string;
    channels: IChannel[]; // channel Id-leri
    domain: string;
    agents: Partial<IUser>[];
    supervisors: Partial<IUser>[];
    projectType: ProjectType;
    projectDirection: ProjectDirection;
    projectName: ProjectName;
}
export interface IChannel {
    _id: string;
    name: string;
    company: ICompany; // Company id-si
    isActive: boolean;
}

export interface IUser {
    _id: string;
    name: string;
    surname: string;
    phone: string;
    status: UserStatus;
    email: string;
    password: string;
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt?: string;
    onlineStatus?: OnlineStatus;
    supervisor: IUser; // assigned supervisor id
    channelIds: IChannel[]; // company-ye bagli channel-lerin id-lerinin massivi
    role: Roles;
    assignedAgents: IUser[]; // ancaq supervisor-larda olacaq
}

export enum Roles {
    Admin = "Admin",
    Agent = "Agent",
    Supervisor = "Supervisor",
    Partner = "Partner"
}
export enum OnlineStatus {
    online = 'online',
    busy = 'busy',
    break = 'break',
    offline = 'offline'
};
export enum UserStatus {
    Active = "active",
    Deactive = "deactive",
    // Fired // isden cixmis
}

// -----------------------------------------------
enum Gender {
    Male,
    Female,
    Gay, // for Bedreddin abi 😁
    Other
}

export interface IVisitor {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    ipAddress?: string;
    conversationId: IConversation;
    gender: Gender;
    device: string;
    os: string;
    language: string;
    originChannel: IChannel; // companyId-ni goture bilirik
    firstSeen: Date;
    lastSeen: Date;
}

enum ConversationStatus {
    Open,
    Closed,
    Snoozed,
    Spam,
    Chatbot
}

export interface IConversation {
    _id: string;
    visitorId: IVisitor;
    agentId?: IUser;
    status: ConversationStatus;
    startedAt: Date;
    closedAt?: Date;
    conversationNote: string;
}
enum MessageSenderType {
    Visitor,
    Agent,
    Chatbot,
}
enum MessageType {
    Text,
    // File,
    // Audio
}

export interface IMessage {
    _id: string;
    conversationId: IConversation; // id
    senderType: MessageSenderType;
    senderId?: string; // agentId, visitorId, chatbot
    messageType: MessageType;
    content: string;
    seenAt?: Date;
    createdAt: Date;
}

export const roleColors: Record<Roles, string> = {
    Admin: 'bg-primary bg-green-500 text-primary-foreground',
    Supervisor: 'bg-purple-500 text-white',
    Agent: 'bg-blue-500 text-white',
    Partner: 'bg-orange-500 text-white',
};
export const roleLabels: Record<Roles, string> = {
    Admin: 'Admin',
    Supervisor: 'Supervisor',
    Agent: 'Agent',
    Partner: 'Partner',
};
export const roleIcons: Record<Roles, any> = {
    Admin: Shield,
    Supervisor: UserCog,
    Agent: UserIcon,
    Partner: UserIcon
}

export interface IExcel {
    _id: string;
    projectId: string;
    name: string;
    description: string;
    agentIds: string[];
    sheetIds: ISheet[];
}
export interface IAgentRowPermission {
    agentId: string;
    startRow: number;
    endRow: number;
}
export interface ISheet {
    _id: string;
    projectId: string;
    excelId: string;
    name: string;
    description: string;
    agentIds: string[];
    agentRowPermissions: IAgentRowPermission[]
    columnIds: IColumn[];
}

export interface IProject {
    _id: string;
    name: string;
    description: string;
    companyId: string;
    projectType: ProjectType;
    projectDirection: ProjectDirection;
    projectName: ProjectName
    supervisors: IUser[];
    agents: IUser[];
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
    columnIds: any[];
    excelIds: any[];
    sheetIds: any[];
}

export interface IColumn {
    _id: string;
    sheetId: string;
    name: string;
    dataKey: string;
    type: "text" | "number" | "phone" | "select";
    visibleToUser: boolean;
    editableByUser: boolean;
    isRequired: boolean;
    order: number;
    options: string[];
    phoneNumbers: string[];
}


// ---------------------------------------------------
export const supervisorUser: IUser = {
    _id: "user_supervisor_1",
    name: "Elvin",
    surname: "Mammadov",
    phone: "+994501112233",
    status: UserStatus.Active,
    email: "elvin.supervisor@company.com",
    password: "hashed_password",
    supervisor: null as any,
    channelIds: [],
    role: Roles.Supervisor,
    assignedAgents: []
};
export const supervisors: IUser[] = [
    supervisorUser,
    {
        _id: "user_supervisor_2",
        name: "Alvin",
        surname: "12Mammadov",
        phone: "+994501112233",
        status: UserStatus.Active,
        email: "elvin.supervisor@company.com",
        password: "hashed_password",
        supervisor: null as any,
        channelIds: [],
        role: Roles.Supervisor,
        assignedAgents: []
    }
]
const agentUser: IUser = {
    _id: "user_agent_1",
    name: "Aysel",
    surname: "Aliyeva",
    phone: "+994557778899",
    status: UserStatus.Active,
    email: "aysel.agent@company.com",
    password: "hashed_password",
    supervisor: supervisorUser,
    channelIds: [],
    role: Roles.Agent,
    assignedAgents: []
};
const agents: IUser[] = [
    agentUser,
    {
        _id: "user_agent_2",
        name: "Eysel",
        surname: "asEliyeva",
        phone: "+994557778899",
        status: UserStatus.Active,
        email: "aysel.agent@company.com",
        password: "hashed_password",
        supervisor: supervisorUser,
        channelIds: [],
        role: Roles.Agent,
        assignedAgents: []
    }
]

const companies: ICompany[] = [{
    _id: "company_1",
    name: "ChatSoft LLC",
    domain: "chatsoft.io",
    channels: [],
    agents: [agentUser],
    supervisors: [supervisorUser],
    projectType: ProjectType.Outbound,
    projectDirection: ProjectDirection.Call,
    projectName: ProjectName.Survey
}];
const company = companies[0]

const websiteChannel: IChannel = {
    _id: "channel_web_1",
    name: "Website Chat",
    company,
    isActive: true,
};

const whatsappChannel: IChannel = {
    _id: "channel_whatsapp_1",
    name: "WhatsApp",
    company,
    isActive: true,
};

company.channels = [websiteChannel, whatsappChannel];
agentUser.channelIds = [websiteChannel, whatsappChannel];
supervisorUser.channelIds = [websiteChannel];

const conversation: IConversation = {
    _id: "conversation_1",
    visitorId: null as any,
    agentId: agentUser,
    status: ConversationStatus.Open,
    startedAt: new Date("2025-01-10T10:00:00Z"),
    conversationNote: "Customer asking about pricing",
};

const visitor: IVisitor = {
    _id: "visitor_1",
    name: "John Doe",
    email: "john.doe@gmail.com",
    phone: "+49123456789",
    ipAddress: "192.168.1.10",
    conversationId: conversation,
    gender: Gender.Male,
    device: "Desktop",
    os: "Windows",
    language: "en",
    originChannel: websiteChannel,
    firstSeen: new Date("2025-01-10T09:58:00Z"),
    lastSeen: new Date("2025-01-10T10:05:00Z"),
};

const messages: IMessage[] = [
    {
        _id: "message_1",
        conversationId: conversation,
        senderType: MessageSenderType.Visitor,
        senderId: visitor._id,
        messageType: MessageType.Text,
        content: "Hi, I want to know your pricing plans.",
        createdAt: new Date("2025-01-10T10:00:10Z"),
    },
    {
        _id: "message_2",
        conversationId: conversation,
        senderType: MessageSenderType.Agent,
        senderId: agentUser._id,
        messageType: MessageType.Text,
        content: "Hello! Sure, I’ll help you with that 😊",
        seenAt: new Date("2025-01-10T10:00:30Z"),
        createdAt: new Date("2025-01-10T10:00:25Z"),
    },
];

export const mokko = {
    companies,
    users: [
        supervisorUser,
        agentUser,
    ],
    channels: [websiteChannel, whatsappChannel],
    visitor,
    conversation,
    messages,
    supervisors,
    agents
};
