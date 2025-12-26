import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum MessageSenderType {
  Visitor = 'Visitor',
  Agent = 'Agent',
  Chatbot = 'Chatbot',
}

export enum MessageType {
  Text = 'Text',
}

export class CreateMessageDto {
  @IsString()
  conversationId: string;

  @IsEnum(MessageSenderType)
  senderType: MessageSenderType;

  @IsString()
  @IsOptional()
  senderId?: string;

  @IsEnum(MessageType)
  messageType: MessageType;

  @IsString()
  content: string;

  @IsDateString()
  @IsOptional()
  seenAt?: string;

  @IsDateString()
  @IsOptional()
  createdAt?: string;
}
