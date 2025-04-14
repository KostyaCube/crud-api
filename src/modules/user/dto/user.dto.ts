import { IsEmail, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  password: string;
}
