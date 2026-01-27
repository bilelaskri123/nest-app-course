import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
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
import { join } from 'node:path';
import { unlinkSync } from 'node:fs';
import { Response } from 'express';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) {}

  public async register(
    registerUserDto: RegisterUserDto,
  ): Promise<{ message: string }> {
    return this.authProvider.register(registerUserDto);
  }

  public async login(loginDto: LoginUserDto) {
    return this.authProvider.login(loginDto);
  }

  /**
   * Get user by ID
   * @param id User ID
   * @returns User or null
   */
  public async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
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

  public async uploadProfileImage(userId: number, file: Express.Multer.File) {
    const user = await this.findById(userId);
    if (user.profileImage) {
      await this.removeImageFromFolder(user.profileImage);
    }

    user.profileImage = file.filename;
    return this.userRepository.save(user);
  }

  public async removeProfileImage(userId: number) {
    const user = await this.findById(userId);
    if (!user.profileImage) {
      throw new BadRequestException('there is no profile image');
    }
    await this.removeImageFromFolder(user.profileImage);
    user.profileImage = null;
    return this.userRepository.save(user);
  }

  public async SendProfileImage(userId: number, res: Response) {
    const user = await this.findById(userId);
    if (!user.profileImage) {
      throw new BadRequestException('there is no profile image');
    }
    res.sendFile(user.profileImage, { root: 'images/user-profiles' });
  }

  /**
   * Verify Email
   * @param userId id of the user from the link
   * @param verificationToken verification token from the link
   * @returns success message
   */
  public async verifyEmail(userId: number, verificationToken: string) {
    const user = await this.findById(userId);
    if (user.verificationToken === null) {
      throw new NotFoundException('there is no verification token');
    }

    if (user.verificationToken !== verificationToken)
      throw new BadRequestException('Invalid link');

    user.isVerified = true;
    user.verificationToken = null;
    await this.userRepository.save(user);
    return { message: 'account has been verified, Please Login' };
  }

  private async removeImageFromFolder(image: string) {
    const imagePath = join(process.cwd(), `./images/user-profiles/${image}`);
    unlinkSync(imagePath);
  }
}
