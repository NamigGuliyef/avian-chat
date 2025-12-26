# Backend Model & DTO Spec (derived from frontend types)

Goal: Align backend Mongoose schemas and Nest DTOs with frontend `src/types` definitions and mock data.

## Approach
- For each frontend type, create a Mongoose schema and Nest DTOs (Create / Update).
- Use references (ObjectId) for relations: Company, Channel, User, Conversation, Message, Visitor, Trigger, Folder.
- Keep timestamps (createdAt, updatedAt) via `timestamps: true` in Mongoose schemas.

---

## Models

### Company
- Fields:
  - _id: ObjectId
  - name: string (required)
  - domain: string
  - email: string
  - website: string
  - channels: ObjectId[] (ref: Channel)
  - createdAt/updatedAt

- Relationships:
  - channels -> Channel documents

- DTOs:
  - CreateCompanyDto { name, domain?, email?, website? }
  - UpdateCompanyDto extends PartialType(CreateCompanyDto)

---

### Channel
- Fields:
  - _id
  - name: string
  - companyId: ObjectId (ref Company)
  - isActive: boolean (default true)
  - createdAt

- DTOs: CreateChannelDto, UpdateChannelDto

---

### User
- Fields:
  - _id
  - name (string)
  - email (string, unique)
  - password (string, optional for seeded users)
  - role (enum: admin|supervayzer|agent|partner)
  - companyId: ObjectId (ref Company)
  - channelIds: ObjectId[] (ref Channel)
  - avatar?: string
  - isOnline: boolean
  - chatbotEnabled?: boolean
  - createdAt/updatedAt

- DTOs: CreateUserDto, UpdateUserDto

---

### Visitor
- Fields:
  - _id
  - visitorId: string (generated)
  - companyId: ObjectId
  - metadata: mixed
  - createdAt/lastSeenAt

- DTOs: CreateVisitorDto, UpdateVisitorDto

---

### Trigger
- Fields:
  - name, companyId, keywords[], autoReply, isActive, createdAt

- DTOs: CreateTriggerDto, UpdateTriggerDto

---

### Message
- Fields:
  - _id
  - conversationId: ObjectId (ref Conversation)
  - content: string
  - sender: enum visitor|agent|bot
  - senderId: ObjectId | string
  - senderName: string
  - timestamp: Date
  - isRead: boolean

- DTOs: CreateMessageDto, UpdateMessageDto

---

### Conversation
- Fields:
  - _id
  - visitorId: ObjectId (ref Visitor)
  - companyId: ObjectId
  - channelId: ObjectId
  - assignedAgentId: ObjectId (ref User)
  - triggerId: ObjectId (ref Trigger)
  - status: enum open|closed|snoozed
  - channel: string (webchat|whatsapp|...)
  - lastMessage: Message (embedded or reference)
  - messages: ObjectId[] or subdocs
  - tags: string[]
  - createdAt/updatedAt

- DTOs: CreateConversationDto, UpdateConversationDto

---

### Folder
- Fields:
  - name, companyId, conversationIds[], createdAt

- DTOs: CreateFolderDto, UpdateFolderDto

---

### ChatbotConfig & WidgetConfig
- WidgetConfig: used by frontend widget; store as embedded doc or separate collection
- ChatbotConfig: id, companyId, isActive, welcomeMessage, fallbackMessage, triggers[], createdAt/updatedAt

---

### CRM Models (Lead, Project, Excel, Sheet, Ticket, OperationLog)
- Lead: phone, maskedPhone, callStatus, callDate, customerStatus, reason, monthlyPayment, tariff, bonus, cost, assignedUser, sheetId, createdAt, updatedAt
- Project: name, description, supervisorIds[], createdAt, updatedAt
- Excel: projectId, name, agentIds[], createdAt
- Sheet: excelId, projectId, columns: ColumnConfig[], createdAt
- Ticket: title, description, type, status, priority, channel, tags[], deadline, assignedAgentId, supervisorId, notes[], attachments[], createdAt, updatedAt
- OperationLog: userId, userName, operation, field, oldValue, newValue, timestamp

- DTOs similarly for create/update

---

## Notes on relationships
- Use ObjectId refs for User, Company, Channel, Conversation, Visitor, Trigger, Project, Excel, Sheet.
- For lists shown in UI (company.channels, conversation.messages) either embed subdocuments (messages) or store refs and populate at query time. For scale choose refs; for performance choose embedding for messages if needed.

---

## Next steps
- Implement Mongoose schema files and DTOs in backend `src/*` directories and register them in modules.
- Update existing schemas (User) to add missing fields and correct naming.
- Create unit tests for DTO validation and basic schema construction.

