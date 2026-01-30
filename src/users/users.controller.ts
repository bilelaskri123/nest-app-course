import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UsersService } from './users.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import * as types from 'src/utils/types';
import { Roles } from './decorators/user-role.decorator';
import { UserType } from 'src/utils/enums';
import { AuthRoleGuard } from './guards/auth-role.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/auth/register')
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiOperation({ summary: 'Register new user' })
  public register(@Body() body: RegisterUserDto) {
    return this.usersService.register(body);
  }

  @Post('/auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'User logged successfully' })
  @ApiOperation({ summary: 'Login User' })
  public login(@Body() body: LoginUserDto) {
    try {
      return this.usersService.login(body);
    } catch (error) {
      console.log('Error during login:', error);
    }
  }

  @Get('/current-user')
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: 'current user data' })
  @ApiOperation({ summary: 'Get current connected user' })
  @ApiSecurity('bearer')
  public getCurrentUser(@CurrentUser('id') id: number) {
    return this.usersService.findById(id);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiResponse({ status: 200, description: 'users fetched successfully' })
  @ApiOperation({ summary: 'Get users list' })
  @ApiSecurity('bearer')
  public getAllUsers() {
    return this.usersService.getAll();
  }

  // PUT: ~/api/users
  @Put()
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
  @ApiResponse({ status: 200, description: 'user updated successfully' })
  @ApiOperation({ summary: 'Update user' })
  @ApiSecurity('bearer')
  public updateUser(
    @CurrentUser('id') id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(id, body);
  }

  @Post('/profile-image')
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiSecurity('bearer')
  @UseInterceptors(
    FileInterceptor('user-image', {
      storage: diskStorage({
        destination: './images/user-profiles',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${Math.round(Math.random() * 1000000)}-${file.originalname}`;
          cb(null, filename);
        },
      }),

      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new Error('Unsupported file type'), false);
        } else {
          cb(null, true);
        }
      },

      limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
    }),
  )
  public uploadProfileImage(
    @CurrentUser('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadProfileImage(id, file);
  }

  @Delete('profile-image')
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiOperation({ summary: 'Delete profile image' })
  @ApiSecurity('bearer')
  public deleteProfileImage(@CurrentUser('id') id: number) {
    console.log(id);
    return this.usersService.removeProfileImage(id);
  }

  @Get('profile-image')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'profile image loaded successfully',
  })
  @ApiOperation({ summary: 'Load profile image' })
  @ApiSecurity('bearer')
  public getProfileImage(@CurrentUser('id') id: number, @Res() res: Response) {
    return this.usersService.SendProfileImage(id, res);
  }

  // DELETE: ~/api/users/:id
  @Delete('/:id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiOperation({ summary: 'Delete User' })
  @ApiSecurity('bearer')
  public deleteUser(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: () => new BadRequestException('Invalid user ID'),
      }),
    )
    userId: number,
    @CurrentUser() payload: types.JWTPayloadType,
  ) {
    return this.usersService.delete(userId, payload);
  }

  @Get('verify-email/:id/:verificationToken')
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiOperation({ summary: 'Verify User Account' })
  public verifyEmail(
    @Param('id', ParseIntPipe) id: number,
    @Param('verificationToken') verificationToken: string,
  ) {
    return this.usersService.verifyEmail(id, verificationToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiOperation({ summary: 'Forgot password' })
  public forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.usersService.sendResetPassword(body.email);
  }

  @Get('reset-password/:id/:resetPasswordToken')
  @ApiResponse({ status: 200, description: 'Valid link' })
  @ApiOperation({ summary: 'Verify Link Validiy' })
  public getResetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Param('resetPasswordToken') resetPasswordToken: string,
  ) {
    return this.usersService.getResetPassword(id, resetPasswordToken);
  }

  @Post('reset-password')
  @ApiResponse({ status: 201, description: 'Password changed successfully' })
  @ApiOperation({ summary: 'Reset Password' })
  public resetPassword(@Body() body: ResetPasswordDto) {
    return this.usersService.resetPassword(body);
  }
}
