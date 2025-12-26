import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../enum/user-role.enum';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsEnum(UserRole)
    @IsNotEmpty()
    role?: UserRole;

    // company id as string (ObjectId)
    @IsString()
    @IsNotEmpty()
    companyID?: string;
}
