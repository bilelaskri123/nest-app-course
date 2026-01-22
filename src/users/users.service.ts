import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dtos/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dtos/login-user.dto';
import { JWTPayloadType } from 'src/utils/types';
import { UserType } from 'src/utils/enums';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthProvider } from './auth.provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) {}

  public async register(
    registerUserDto: RegisterUserDto,
  ): Promise<{ token: string }> {
    return this.authProvider.register(registerUserDto);
  }

  public async login(loginDto: LoginUserDto): Promise<{ token: string }> {
    return this.authProvider.login(loginDto);
  }

  /**
   * Get user by ID
   * @param id User ID
   * @returns User or null
   */
  public async findOneBy(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ id });
  }

  public async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async verifyToken(token: string): Promise<JWTPayloadType | null> {
    return this.authProvider.verifyToken(token);
  }

  public async update(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.username = updateUserDto.username ?? user.username;

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    const updatedUser = await this.userRepository.save(user);
    return updatedUser;
  }

  public async delete(userId: number, payload: JWTPayloadType) {
    if (userId !== payload.id && payload.userType !== UserType.ADMIN) {
      throw new ForbiddenException('access denied');
    }
    await this.userRepository.delete({ id: userId });
    return { message: 'User deleted successfully' };
  }
}
