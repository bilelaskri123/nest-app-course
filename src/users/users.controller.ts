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
@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/auth/register')
  public register(@Body() body: RegisterUserDto) {
    return this.usersService.register(body);
  }

  @Post('/auth/login')
  @HttpCode(HttpStatus.OK)
  public login(@Body() body: LoginUserDto) {
    try {
      return this.usersService.login(body);
    } catch (error) {
      console.log('Error during login:', error);
    }
  }

  @Get('/current-user')
  @UseGuards(AuthGuard)
  public getCurrentUser(@CurrentUser('id') id: number) {
    return this.usersService.findById(id);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRoleGuard)
  public getAllUsers() {
    return this.usersService.getAll();
  }

  // PUT: ~/api/users
  @Put()
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
  public updateUser(
    @CurrentUser('id') id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(id, body);
  }

  @Post('/profile-image')
  @UseGuards(AuthGuard)
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
  public deleteProfileImage(@CurrentUser('id') id: number) {
    console.log(id);
    return this.usersService.removeProfileImage(id);
  }

  @Get('profile-image')
  @UseGuards(AuthGuard)
  public getProfileImage(@CurrentUser('id') id: number, @Res() res: Response) {
    return this.usersService.SendProfileImage(id, res);
  }

  // DELETE: ~/api/users/:id
  @Delete('/:id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
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
}
