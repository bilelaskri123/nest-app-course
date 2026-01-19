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
  UseGuards,
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
  public getCurrentUser(@CurrentUser() user: types.JWTPayloadType) {
    return this.usersService.getCurrentUser(user.id);
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
    @CurrentUser() payload: types.JWTPayloadType,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(payload.id, body);
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
