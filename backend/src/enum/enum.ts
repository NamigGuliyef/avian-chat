export enum UserRole {
  admin = 'Admin',
  supervisor = 'Supervisor',
  agent = 'Agent',
  partner = 'Partner',
}


export enum OnlineStatus {
  online = "online",
  busy = "busy",
  break = "break",
  offline = "offline"
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

export enum ColumnType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Select = 'select',
  Phone = 'phone',
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