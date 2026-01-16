import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UsersService } from './users.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import * as types from 'src/utils/types';
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
}
