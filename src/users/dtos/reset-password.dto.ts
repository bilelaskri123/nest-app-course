import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  userId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  resetPasswordToken: string;
}
