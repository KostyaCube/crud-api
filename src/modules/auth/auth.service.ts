import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserService } from '../user/user.service';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userService.findOneByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { email: user.email, name: user.firstName };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
