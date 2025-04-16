import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn((dto) => ({
      access_token: 'mocked-jwt-token',
    })),
    login: jest.fn((dto) => ({
      access_token: 'mocked-jwt-token',
    })),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    it('should call authService.register and return access token', async () => {
      const dto: RegisterDto = {
        // верные рег. данные, должен выдаваться токен
        email: 'test@example.com',
        firstName: 'Ivan',
        lastName: 'Petrov',
        password: '123456',
      };

      const result = await authController.signUp(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result.access_token).toEqual('mocked-jwt-token');
    });

    it('should throw error if validation fails', async () => {
      // тест валидации полей с проверкой возвращаемых ошибок
      const dto: RegisterDto = {
        email: 'invalid-email', // неправильный e-mail
        firstName: 'Ivan',
        lastName: 'Petrov',
        password: '123456',
      };

      try {
        await authController.signUp(dto);
      } catch (error) {
        expect(error.response.statusCode).toBe(400);
        expect(error.response.message).toContain('email must be an email');
      }
    });

    it('should throw error if one field is empty', async () => {
      const dto: RegisterDto = {
        email: 'invalid-email',
        firstName: 'Ivan',
        lastName: '',
        password: '123456',
      };

      try {
        await authController.signUp(dto);
      } catch (error) {
        expect(error.response.statusCode).toBe(400);
      }
    });

    it('should throw error if password is too short', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        firstName: 'Ivan',
        lastName: 'Petrov',
        password: '123', // короткий пароль
      };
      try {
        await authController.signUp(dto);
      } catch (error) {
        expect(error.response.statusCode).toBe(400);
        expect(error.response.message).toContain('password must be longer than or equal to 6 characters');
      }
    });
  });

  describe('signIn', () => {
    it('should call authService.login and return access token', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: '123456',
      };

      const result = await authController.signIn(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ access_token: 'mocked-jwt-token' });
    });

    it('should throw error if validation fails for login', async () => {
      const dto: LoginDto = {
        email: 'invalid-email', // неправильный e-mail
        password: '123456',
      };

      try {
        await authController.signIn(dto);
      } catch (error) {
        expect(error.response.statusCode).toBe(400);
        expect(error.response.message).toContain('email must be an email');
      }
    });

    it('should throw error if validation fails for login', async () => {
      const dto: LoginDto = {
        email: 'invalid-email',
        password: '12', // короткий пароль
      };

      try {
        await authController.signIn(dto);
      } catch (error) {
        expect(error.response.statusCode).toBe(400);
        expect(error.response.message).toContain('password must be longer than or equal to 6 characters');
      }
    });
  });
});
