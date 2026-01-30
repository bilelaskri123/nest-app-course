import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsOptional()
  @Length(3, 150)
  @ApiProperty()
  username?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
