import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { JWTPayloadType } from 'src/utils/types';
import { LoginUserDto } from './dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import { randomBytes } from 'node:crypto';

@Injectable()
export class AuthProvider {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  // Add authentication related methods here

  public async register(
    registerUserDto: RegisterUserDto,
  ): Promise<{ message: string }> {
    const { username, email, password } = registerUserDto;
    const userFromDb = await this.userRepository.findOne({ where: { email } });
    if (userFromDb) throw new BadRequestException('User already exists');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const savedUser = await this.userRepository.save({
      username,
      email,
      password: hashedPassword,
      verificationToken: randomBytes(32).toString('hex'),
    });

    const link = this.generateLink(savedUser.id, savedUser.verificationToken);
    await this.mailService.sendVerifyEmailTemplate(savedUser.email, link);
    // const payload: JWTPayloadType = {
    //   id: savedUser.id,
    //   userType: savedUser.userType,
    // };
    // const token = await this.generateJWTToken(payload);
    // return { token };
    return {
      message:
        'Verification token has been sent to your email, please verify your email address',
    };
  }

  public async login(loginDto: LoginUserDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Invalid credentials');
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw new BadRequestException('Invalid credentials');

    if (!user.isVerified) {
      let verificationToken = user.verificationToken;
      if (!verificationToken) {
        user.verificationToken = randomBytes(32).toString('hex');
        const result = await this.userRepository.save(user);
      }

      const link = this.generateLink(user.id, user.verificationToken!);
      await this.mailService.sendVerifyEmailTemplate(email, link);
      return {
        message:
          'Verification token has been sent to your email, please verify your email address',
      };
    }

    const token = await this.generateJWTToken({
      id: user.id,
      userType: user.userType,
    });
    return { token };
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

  /**
   * Generate JWT token
   * @param payload JWT payload
   * @returns JWT token
   */
  private generateJWTToken(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  private generateLink(id: number, verificationToken: string) {
    return `${this.configService.get<string>('DOMAIN')}/api/users/verify-email/${id}/${verificationToken}`;
  }
}
