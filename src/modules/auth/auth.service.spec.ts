import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { LoginDto, RegisterDto } from '../auth/dto/auth.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Очистить моки после каждого теста
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: '123456',
      };

      // Мокирование проверки существующего пользователя для возврата null (пользователь не существует)
      mockUserService.findOneByEmail.mockResolvedValue(null);

      // Мокирование создания пользователя
      mockUserService.create.mockResolvedValue({
        id: 1,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: await bcrypt.hash(dto.password, 10),
      });

      mockJwtService.sign.mockReturnValue('mocked-jwt-token');

      const result = await authService.register(dto);

      expect(result.access_token).toBe('mocked-jwt-token');
      expect(mockUserService.findOneByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockUserService.create).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: '123456',
      };

      // Проверка существующего пользователя
      mockUserService.findOneByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: 'hashed-password',
      });

      try {
        await authService.register(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('User already exists');
      }
    });
  });

  describe('login', () => {
    it('should successfully log in and return a token', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: '123456',
      };

      // Поиск юзера
      mockUserService.findOneByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
        firstName: 'John',
        lastName: 'Doe',
        password: await bcrypt.hash(dto.password, 10),
      });

      mockJwtService.sign.mockReturnValue('mocked-jwt-token');

      const result = await authService.login(dto);

      expect(result.access_token).toBe('mocked-jwt-token');
      expect(mockUserService.findOneByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: '123456',
      };

      mockUserService.findOneByEmail.mockResolvedValue(null);

      try {
        await authService.login(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid credentials');
      }
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: '123456',
      };

      mockUserService.findOneByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
        firstName: 'John',
        lastName: 'Doe',
        password: await bcrypt.hash('wrong-password', 10),
      });

      try {
        await authService.login(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid credentials');
      }
    });
  });
});
