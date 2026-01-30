import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  @ApiProperty({ description: 'The new password', default: '' })
  newPassword: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty({ description: 'the current user id' })
  userId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @ApiProperty({ description: 'Reset password token was sent by email' })
  resetPasswordToken: string;
}
