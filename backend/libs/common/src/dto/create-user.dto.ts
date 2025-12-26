import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsArray, IsBoolean } from 'class-validator';
import { UserRole } from '../enum/user-role.enum';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    @MinLength(8)
    password?: string;

    @IsEnum(UserRole)
    @IsNotEmpty()
    role?: UserRole;

    // company id as string (ObjectId)
    @IsString()
    @IsOptional()
    companyId?: string;

    @IsArray()
    @IsOptional()
    channelIds?: string[];

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsOptional()
    isOnline?: boolean;

    @IsOptional()
    chatbotEnabled?: boolean;
}
