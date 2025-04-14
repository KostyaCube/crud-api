import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: UserDto): Promise<User> {
    return await this.userRepository.save(createUserDto);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.password',
      ])
      .where('user.email = :email', { email })
      .getOne();

    return user || null;
  }
}
