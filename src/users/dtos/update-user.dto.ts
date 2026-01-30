// import { OmitType, PartialType } from '@nestjs/mapped-types';
import { OmitType, PartialType } from '@nestjs/swagger';
import { RegisterUserDto } from './register-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(RegisterUserDto, ['email']),
) {}
