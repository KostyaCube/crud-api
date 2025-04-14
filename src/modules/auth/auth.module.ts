import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService],
})
export class AuthModule {}
