import { IsDateString, IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';

export enum MessageSenderType {
  visitor = 'visitor',
  agent = 'agent',
  bot = 'bot',
}

export class CreateMessageDto {
  @IsString()
  conversationId: string;

  @IsEnum(MessageSenderType)
  sender: MessageSenderType;

  @IsString()
  @IsOptional()
  senderId?: string;

  @IsString()
  @IsOptional()
  senderName?: string;

  @IsString()
  content: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
