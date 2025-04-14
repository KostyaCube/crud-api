import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @MinLength(6)
  password: string;
}
