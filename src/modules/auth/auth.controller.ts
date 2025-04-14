import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  signUp(@Body() RegisterDto: RegisterDto) {
    return this.authService.register(RegisterDto);
  }

  @Post('login')
  signIn(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }
}
