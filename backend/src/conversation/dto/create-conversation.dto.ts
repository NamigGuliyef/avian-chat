import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum ConversationStatus {
  Open = 'Open',
  Closed = 'Closed',
  Snoozed = 'Snoozed',
  Spam = 'Spam',
  Chatbot = 'Chatbot',
}

export class CreateConversationDto {
  @IsString()
  visitorId: string;

  @IsString()
  @IsOptional()
  agentId?: string;

  @IsEnum(ConversationStatus)
  @IsOptional()
  status?: ConversationStatus;

  @IsDateString()
  @IsOptional()
  startedAt?: string;

  @IsDateString()
  @IsOptional()
  closedAt?: string;

  @IsString()
  @IsOptional()
  conversationNote?: string;
}
