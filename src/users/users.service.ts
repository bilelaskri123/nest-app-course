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
import { JwtService } from '@nestjs/jwt';
import { JWTPayloadType } from 'src/utils/types';
import { ConfigService } from '@nestjs/config';
import { UserType } from 'src/utils/enums';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(
    registerUserDto: RegisterUserDto,
  ): Promise<{ token: string }> {
    const { username, email, password } = registerUserDto;
    const userFromDb = await this.userRepository.findOne({ where: { email } });
    if (userFromDb) throw new BadRequestException('User already exists');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const savedUser = await this.userRepository.save({
      username,
      email,
      password: hashedPassword,
    });

    const payload: JWTPayloadType = {
      id: savedUser.id,
      userType: savedUser.userType,
    };
    const token = await this.generateJWTToken(payload);
    return { token };
  }

  public async login(loginDto: LoginUserDto): Promise<{ token: string }> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Invalid credentials');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new BadRequestException('Invalid credentials');
    const token = await this.generateJWTToken({
      id: user.id,
      userType: user.userType,
    });
    return { token };
  }

  /**
   * Get current user by ID
   * @param id User ID
   * @returns User or null
   */
  public async getCurrentUser(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ id });
  }

  public async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  public async verifyToken(token: string): Promise<JWTPayloadType | null> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      return payload;
    } catch (error) {
      return null;
    }
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

  /**
   * Generate JWT token
   * @param payload JWT payload
   * @returns JWT token
   */
  private generateJWTToken(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
