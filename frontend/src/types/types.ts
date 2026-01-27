import { ILoginUser } from "@/api/users";
import { Shield, UserCog, UserIcon } from "lucide-react";


// auth-----------------------------------------------
export interface AuthUser {
    id: string;
    email: string;
    role?: string;
}

export interface AuthSession {
    token: string | null;
    user?: ILoginUser;
}

export interface AuthContextType {
    session: AuthSession;
    isAuthenticated: boolean;
    setSession: (session: AuthSession) => void;
    logout: () => void;
}

// -----------------------------------------------
export enum UserRole {
    admin = 'Admin',
    supervisor = 'Supervisor',
    agent = 'Agent',
    partner = 'Partner',
}


export enum ProjectType {
    outbound = "0",
    inbound = "1"
}


export enum ProjectDirection {
    call = "0",
    social = "1"
}


export enum ProjectName {
    survey = "0",
    telesales = "1",
    telemarketing = "2",
}



export enum BlockType {
    MESSAGE = 'message',
    ACTION = 'action',
    GOTO = 'goto',
}


export enum ActionType {
    CLOSE = 'close',
    OPEN = 'open',
    AGENT = 'agent',
}

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
    agentIds: IUser[];
    sheetIds: ISheet[];
}

export interface IAgentRowPermission {
    agentId: string;
    name: string;
    surname: string;
    ranges: Array<{
        startRow: string;
        endRow: string;
    }>;
}

export interface ISheet {
    _id: string;
    projectId: string;
    excelId: string;
    name: string;
    description: string;
    agentIds: IAgentRowPermission[];
    agentRowPermissions: IAgentRowPermission[]
    columnIds: SheetColumnForm[];
}
export interface IAdminColumnOption {
    label: string;
    value: string;
}
export enum ColumnType {
    Text = 'text',
    Number = 'number',
    Date = 'date',
    Select = 'select',
    Phone = 'phone',
}

export interface ISheetColumn {
    _id: string;
    name: string;
    projectId?: string;
    dataKey: string;
    type: ColumnType;
    options?: IAdminColumnOption[];
    order: number;
}

export interface SheetRowForm {
    sheetId: string;
    rowNumber: number;
    data: any;
}
export interface SheetColumnForm {
    columnId: ISheetColumn;
    editable: boolean;
    required: boolean;
    order: number;
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

export interface ISelectOption {
    value: string;
    label: string;
}
export interface IColumn {
    _id: string;
    sheetId: string;
    name: string;
    dataKey: string;
    type: ColumnType;
    visibleToUser: boolean;
    editableByUser: boolean;
    isRequired: boolean;
    order: number;
    options: ISelectOption[];
    phoneNumbers: string[];
}

