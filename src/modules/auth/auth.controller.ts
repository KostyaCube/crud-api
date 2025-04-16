import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import {
  INTERNAL_SERVER_ERROR,
  USER_CREATED,
  LOGIN_RES,
  NOT_FOUND_AUTH,
  VALIDATION_FAILS,
} from 'src/constants/api-messages';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // регистрация новых юзеров, описание ответов
  @Post('register')
  @ApiCreatedResponse({ description: USER_CREATED })
  @ApiBadRequestResponse({ description: VALIDATION_FAILS })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  signUp(@Body() RegisterDto: RegisterDto) {
    return this.authService.register(RegisterDto);
  }

  @Post('login')
  @ApiCreatedResponse({ description: LOGIN_RES })
  @ApiNotFoundResponse({ description: NOT_FOUND_AUTH })
  @ApiBadRequestResponse({ description: VALIDATION_FAILS })
  @ApiInternalServerErrorResponse({ description: INTERNAL_SERVER_ERROR })
  signIn(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }
}
