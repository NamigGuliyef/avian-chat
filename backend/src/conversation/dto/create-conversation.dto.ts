import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export enum ConversationStatus {
  open = 'open',
  closed = 'closed',
  snoozed = 'snoozed',
}

export class CreateConversationDto {
  @IsString()
  visitorId: string;

  @IsString()
  @IsOptional()
  assignedAgentId?: string;

  @IsEnum(ConversationStatus)
  @IsOptional()
  status?: ConversationStatus;

  @IsString()
  @IsOptional()
  channel?: string;

  @IsString()
  @IsOptional()
  triggerId?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsDateString()
  @IsOptional()
  createdAt?: string;
}
