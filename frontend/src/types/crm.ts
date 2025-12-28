export type CallStatus = 'successful' | 'unsuccessful' | 'pending' | 'callback' | 'no_answer';
export type CustomerStatus = 'ok' | 'not_ok' | 'pending' | 'interested';
export type CrmUserRole = 'admin' | 'supervayzer' | 'agent' | 'partner';
export type UserStatus = 'available' | 'busy' | 'break' | 'offline';

export interface Lead {
  id: string;
  phone: string;
  maskedPhone: string;
  callStatus: CallStatus;
  callDate: string;
  customerStatus: CustomerStatus;
  reason: string;
  monthlyPayment: number;
  tariff: string;
  bonus: string;
  cost: number;
  assignedUser?: string;
  createdAt: string;
  updatedAt: string;
  sheetId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: CrmUserRole;
  companyId?: string;
  supervisorId?: string;
  isActive: boolean;
  status?: UserStatus;
  avatar?: string;
  activeChats?: number;
  activeCalls?: number;
  createdAt: string;
}

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'phone';

export interface ColumnOption {
  value: string;
  label: string;
  color?: string;
}

export interface ColumnConfig {
  id: string;
  name: string;
  dataKey: string;
  type: ColumnType;
  options?: ColumnOption[];
  phoneNumbers?: string[]; // For phone type columns
  visibleToUser: boolean;
  editableByUser: boolean;
  order: number;
  userIds?: string[];
  sheetId?: string;
  isRequired?: boolean;
}

// Agent row permission for sheets
export interface AgentRowPermission {
  agentId: string;
  startRow: number;
  endRow: number;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  operation: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface Stats {
  totalCalls: number;
  successfulCalls: number;
  okCustomers: number;
  totalCost: number;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
}

// Project - Admin creates, assigns to supervisors
export interface Project {
  id: string;
  name: string;
  description?: string;
  supervisorIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Excel/Workbook - Supervisor creates within project
export interface Excel {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  agentIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Sheet - Lives inside Excel, has columns
export interface Sheet {
  id: string;
  excelId: string;
  projectId: string;
  name: string;
  description?: string;
  agentIds: string[];
  agentRowPermissions?: AgentRowPermission[];
  columns: ColumnConfig[];
  createdAt: string;
  updatedAt: string;
}

// Supervisor assignment
export interface SupervisorAssignment {
  id: string;
  supervisorId: string;
  agentIds: string[];
  createdAt: string;
}

export interface AgentKPI {
  agentId: string;
  answeredTickets: number;
  closedTickets: number;
  avgHandleTime: number;
  slaCompliance: number;
}
